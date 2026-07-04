import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraIcon } from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState, Screen } from '../components/ui';
import { getCurrentUser, signOutUser } from '../services/auth';
import { uploadProfileImage } from '../services/profileImages';
import { getPatientByEmail, updatePatient } from '../services/patients';
import { colors, spacing, typography } from '../theme';

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'Not added yet'}</Text>
  </View>
);

const ChipList = ({ items }) => {
  if (!items?.length) {
    return <Text style={styles.muted}>No preferences added yet.</Text>;
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

const ProfileScreen = () => {
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
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phoneNumber,
      userData.birthDate,
      userData.gender,
      userData.relationshipStatus,
      userData.selectedOption,
      userData.therapistPreferences?.length,
      userData.therapistExperience?.length,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [userData]);

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
          role: 'patients',
          uri: imageUri,
        });
        setSelectedImageUri(imageUrl);
        setImageChanged(true);
        await updatePatient(currentUser.uid, { profileImage: imageUrl });
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

        const patient = await getPatientByEmail(currentUser.email);
        if (patient) setUserData(patient);
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
        <LoadingState message="Loading your profile..." />
      </Screen>
    );
  }

  if (!userData) {
    return (
      <Screen scroll={false}>
        <EmptyState
          title="No profile found"
          message={errorMessage || 'We could not find patient details for this account.'}
        />
      </Screen>
    );
  }

  const displayName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

  return (
    <Screen>
      {errorMessage ? <ErrorState title="Profile notice" message={errorMessage} /> : null}

      <Card style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Avatar
            source={
              imageChanged
                ? { uri: selectedImageUri }
                : userData.profileImage
                  ? { uri: userData.profileImage }
                  : null
            }
            name={displayName || userData.email || 'Patient'}
            size={136}
            style={styles.avatar}
          />
          <Pressable accessibilityRole="button" onPress={pickImage} style={styles.cameraButton}>
            <CameraIcon size={24} color={colors.primary} />
          </Pressable>
        </View>
        <Text style={styles.name}>{displayName || 'Patient profile'}</Text>
        <Text style={styles.email}>{userData.email}</Text>
        <Button title="Edit Profile" variant="secondary" onPress={() => navigation.navigate('EditProfile')} />
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
        <Text style={styles.sectionTitle}>Contact info</Text>
        <Field label="Phone" value={userData.phoneNumber} />
        <Field label="Date of birth" value={userData.birthDate} />
        <Field label="Address" value={userData.address} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Personal details</Text>
        <Field label="Gender" value={userData.gender} />
        <Field label="Relationship status" value={userData.relationshipStatus} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Therapy preferences</Text>
        <Field label="Therapy type" value={userData.selectedOption} />
        <Text style={styles.subsectionTitle}>Therapist preferences</Text>
        <ChipList items={userData.therapistPreferences} />
        <Text style={styles.subsectionTitle}>Preferred experience</Text>
        <ChipList items={userData.therapistExperience} />
      </Card>

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

export default ProfileScreen;
