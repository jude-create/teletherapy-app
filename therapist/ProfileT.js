import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser, signOutUser } from '../services/auth';
import { formatSlotLabel, getSlotsFromTherapist } from '../services/availability';
import { uploadProfileImage } from '../services/profileImages';
import { getTherapistByUid, updateTherapist } from '../services/therapists';
import { colors, spacing, typography } from '../theme';

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not added yet'}</Text>
  </View>
);

const ChipList = ({ items }) => {
  if (!items?.length) {
    return <Text style={styles.muted}>No details added yet.</Text>;
  }

  return (
    <View style={styles.chipList}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const ProfileT = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Permission to access media library is required to update your photo.');
      }
    })();
  }, []);

  const profileCompletion = useMemo(() => {
    if (!userData) return 0;
    const fields = [
      userData.name,
      userData.email,
      userData.phone,
      userData.age,
      userData.license,
      userData.bio || userData.text,
      userData.selectedOption?.length,
      userData.therapistProfile?.length,
      userData.therapistExperiences?.length,
      Object.values(userData.selectedDays || {}).some(Boolean),
      userData.time,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [userData]);

  const availableDays = useMemo(
    () =>
      Object.entries(userData?.selectedDays || {})
        .filter(([, selected]) => selected)
        .map(([day]) => day),
    [userData]
  );
  const availabilitySlots = useMemo(() => getSlotsFromTherapist(userData), [userData]);
  const verificationStatus = userData?.verificationStatus || (userData?.verified ? 'approved' : 'pending');

  const pickImage = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setErrorMessage('You need to be signed in to update your profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        const imageUrl = await uploadProfileImage({
          uid: currentUser.uid,
          role: 'therapists',
          uri: imageUri,
        });
        setSelectedImageUri(imageUrl);
        setImageChanged(true);
        await updateTherapist(currentUser.uid, { profileImage: imageUrl });
        setUserData((current) => ({ ...current, profileImage: imageUrl }));
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setErrorMessage('No authenticated user found.');
          return;
        }

        const therapist = await getTherapistByUid(currentUser.uid);
        if (therapist) setUserData(therapist);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingState message="Loading therapist profile..." />
      </Screen>
    );
  }

  if (!userData) {
    return (
      <Screen scroll={false}>
        <EmptyState
          title="No therapist profile found"
          message={errorMessage || 'We could not find therapist details for this account.'}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {errorMessage ? <ErrorState title="Profile notice" message={errorMessage} /> : null}

      <Card style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Avatar
            name={userData.name || userData.email || 'Therapist'}
            size={136}
            style={styles.avatar}
            source={
              imageChanged
                ? { uri: selectedImageUri }
                : userData.profileImage
                  ? { uri: userData.profileImage }
                  : null
            }
          />
          <Pressable accessibilityRole="button" onPress={pickImage} style={styles.cameraButton}>
            <CameraIcon size={24} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.name}>{userData.name || 'Therapist profile'}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <View
          style={[
            styles.verifiedBadge,
            verificationStatus === 'approved' && styles.verifiedBadgeApproved,
            verificationStatus === 'rejected' && styles.verifiedBadgeRejected,
          ]}
        >
          <Text
            style={[
              styles.verifiedText,
              verificationStatus === 'approved' && styles.verifiedTextApproved,
              verificationStatus === 'rejected' && styles.verifiedTextRejected,
            ]}
          >
            {verificationStatus === 'approved'
              ? 'Verified therapist'
              : verificationStatus === 'rejected'
                ? 'Profile needs updates'
                : 'Pending admin review'}
          </Text>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile completion</Text>
          <Text style={styles.completionText}>{profileCompletion}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${profileCompletion}%` }]} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Professional details</Text>
        <Field label="Phone" value={userData.phone} />
        <Field label="Age" value={userData.age} />
        <Field label="License number" value={userData.license} />
        <Field label="Bio" value={userData.bio || userData.text} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Clinical focus</Text>
        <Text style={styles.subsectionTitle}>Therapy types</Text>
        <ChipList items={userData.therapyTypes || (Array.isArray(userData.selectedOption) ? userData.selectedOption : [userData.selectedOption].filter(Boolean))} />
        <Text style={styles.subsectionTitle}>Profile preferences</Text>
        <ChipList items={userData.preferredPatientGroups || userData.therapistProfile} />
        <Text style={styles.subsectionTitle}>Experience</Text>
        <Field label="Years of experience" value={userData.yearsExperience} />
        <ChipList items={userData.specialties || userData.therapistExperiences} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Availability</Text>
        <ChipList items={availabilitySlots.length ? availabilitySlots.map(formatSlotLabel) : availableDays} />
        {!availabilitySlots.length ? <Field label="Time window" value={userData.time} /> : null}
        <Button
          title="Edit Availability"
          variant="outline"
          onPress={() => navigation.navigate('Availability')}
        />
      </Card>

      <Button
        title="Edit Profile"
        onPress={() => navigation.navigate('EditProfile')}
      />

      <Button title="Logout" variant="outline" onPress={signOutUser} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 4,
    borderColor: colors.primarySoft,
  },
  cameraButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    ...typography.heading,
    textAlign: 'center',
  },
  email: {
    ...typography.small,
    textAlign: 'center',
  },
  verifiedBadge: {
    borderRadius: 999,
    backgroundColor: '#FFF6E5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  verifiedBadgeApproved: {
    backgroundColor: colors.successSoft,
  },
  verifiedBadgeRejected: {
    backgroundColor: colors.dangerSoft,
  },
  verifiedText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '800',
  },
  verifiedTextApproved: {
    color: colors.success,
  },
  verifiedTextRejected: {
    color: colors.danger,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
  },
  subsectionTitle: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  completionText: {
    ...typography.subheading,
    color: colors.primary,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  field: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fieldValue: {
    ...typography.body,
  },
  muted: {
    ...typography.small,
  },
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ProfileT;
