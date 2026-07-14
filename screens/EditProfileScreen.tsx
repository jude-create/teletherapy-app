import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import { Avatar, Button, Card, ErrorState, Input, LoadingState, Screen } from '../components/ui';
import { getCurrentUser } from '../services/auth';
import { createSlotId, formatSlotLabel, normalizeTime } from '../services/availability';
import { getPatientByUid, updatePatient } from '../services/patients';
import { uploadProfileImage } from '../services/profileImages';
import { getTherapistByUid, updateTherapist } from '../services/therapists';
import { colors, spacing, typography } from '../theme';

const splitList = (value: unknown) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value: unknown) => String(Array.isArray(value) ? value.join(', ') : value || '');
const fieldValue = (value: unknown) => String(value || '');

type ProfileForm = Record<string, string>;

const EditProfileScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [role, setRole] = useState('');
  const [form, setForm] = useState<ProfileForm>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setErrorMessage('You need to be signed in to edit your profile.');
          return;
        }

        const therapist = await getTherapistByUid(currentUser.uid);
        if (therapist) {
          setRole('therapist');
          setForm({
            name: fieldValue(therapist.name),
            phone: fieldValue(therapist.phone),
            address: fieldValue(therapist.address || therapist.location),
            license: fieldValue(therapist.license),
            licenseBoard: fieldValue(therapist.licenseBoard),
            age: fieldValue(therapist.age),
            bio: fieldValue(therapist.bio),
            yearsExperience: fieldValue(therapist.yearsExperience),
            therapyTypes: joinList(therapist.therapyTypes || therapist.selectedOption),
            specialties: joinList(therapist.specialties || therapist.therapistExperiences),
            preferredPatientGroups: joinList(therapist.preferredPatientGroups || therapist.therapistProfile),
            profileImage: fieldValue(therapist.profileImage),
            availabilityDay: therapist.availabilitySlots?.[0]?.day || 'Monday',
            startTime: therapist.availabilitySlots?.[0]?.startTime || '09:00',
            endTime: therapist.availabilitySlots?.[0]?.endTime || '10:00',
          });
          return;
        }

        const patient = await getPatientByUid(currentUser.uid);
        setRole('patient');
        setForm({
          firstName: patient?.firstName || '',
          lastName: patient?.lastName || '',
          phoneNumber: patient?.phoneNumber || '',
          address: patient?.address || '',
          birthDate: patient?.birthDate || '',
          gender: patient?.gender || '',
          relationshipStatus: patient?.relationshipStatus || '',
          profileImage: patient?.profileImage || '',
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateField = (field: string, value: string) => {
    setSuccessMessage('');
    setErrorMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const currentUser = getCurrentUser();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) return;

      const imageUrl = await uploadProfileImage({
        uid: currentUser.uid,
        role: role === 'therapist' ? 'therapists' : 'patients',
        uri: result.assets[0].uri,
      });
      updateField('profileImage', imageUrl);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const currentUser = getCurrentUser();
      if (!currentUser) throw new Error('You need to be signed in to save your profile.');

      if (role === 'therapist') {
        const start = normalizeTime(form.startTime);
        const end = normalizeTime(form.endTime);
        const availabilitySlots =
          start && end && end > start
            ? [{ id: createSlotId(), day: form.availabilityDay || 'Monday', startTime: start, endTime: end }]
            : [];
        const selectedDays = availabilitySlots.length ? { [availabilitySlots[0].day]: true } : {};

        await updateTherapist(currentUser.uid, {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          license: form.license.trim(),
          licenseBoard: form.licenseBoard.trim(),
          age: form.age.trim(),
          bio: form.bio.trim(),
          yearsExperience: form.yearsExperience.trim(),
          therapyTypes: splitList(form.therapyTypes),
          specialties: splitList(form.specialties),
          preferredPatientGroups: splitList(form.preferredPatientGroups),
          profileImage: form.profileImage,
          ...(availabilitySlots.length
            ? { availabilitySlots, selectedDays, time: formatSlotLabel(availabilitySlots[0]) }
            : {}),
        });
      } else {
        await updatePatient(currentUser.uid, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          address: form.address.trim(),
          birthDate: form.birthDate.trim(),
          gender: form.gender.trim(),
          relationshipStatus: form.relationshipStatus.trim(),
          profileImage: form.profileImage,
        });
      }

      setSuccessMessage('Profile saved successfully.');
      navigation.goBack();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <LoadingState message="Loading profile editor..." />
      </Screen>
    );
  }

  const displayName =
    role === 'therapist' ? form.name : `${form.firstName || ''} ${form.lastName || ''}`.trim();

  return (
    <Screen contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <Avatar source={form.profileImage ? { uri: form.profileImage } : null} name={displayName} size={96} />
        <Button title="Upload Photo" variant="secondary" onPress={pickImage} />
      </Card>

      {errorMessage ? <ErrorState title="Profile issue" message={errorMessage} /> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <Card>
        <Text style={styles.title}>Edit Profile</Text>
        {role === 'therapist' ? (
          <View style={styles.form}>
            <Input label="Name" value={form.name} onChangeText={(value) => updateField('name', value)} />
            <Input label="Phone" value={form.phone} onChangeText={(value) => updateField('phone', value)} />
            <Input label="Address / location" value={form.address} onChangeText={(value) => updateField('address', value)} />
            <Input label="License number" value={form.license} onChangeText={(value) => updateField('license', value)} />
            <Input label="Licensing board / state" value={form.licenseBoard} onChangeText={(value) => updateField('licenseBoard', value)} />
            <Input label="Age" keyboardType="number-pad" value={form.age} onChangeText={(value) => updateField('age', value)} />
            <Input label="Bio" multiline value={form.bio} onChangeText={(value) => updateField('bio', value)} inputStyle={styles.textArea} />
            <Input label="Years of experience" keyboardType="number-pad" value={form.yearsExperience} onChangeText={(value) => updateField('yearsExperience', value)} />
            <Input label="Therapy types" value={form.therapyTypes} onChangeText={(value) => updateField('therapyTypes', value)} placeholder="Individual, Couples" />
            <Input label="Specialties" value={form.specialties} onChangeText={(value) => updateField('specialties', value)} placeholder="Anxiety, Depression" />
            <Input label="Preferred patient groups" value={form.preferredPatientGroups} onChangeText={(value) => updateField('preferredPatientGroups', value)} />
            <Input label="Availability day" value={form.availabilityDay} onChangeText={(value) => updateField('availabilityDay', value)} />
            <View style={styles.timeRow}>
              <Input label="Start" value={form.startTime} onChangeText={(value) => updateField('startTime', value)} style={styles.timeInput} />
              <Input label="End" value={form.endTime} onChangeText={(value) => updateField('endTime', value)} style={styles.timeInput} />
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Input label="First name" value={form.firstName} onChangeText={(value) => updateField('firstName', value)} />
            <Input label="Last name" value={form.lastName} onChangeText={(value) => updateField('lastName', value)} />
            <Input label="Phone" value={form.phoneNumber} onChangeText={(value) => updateField('phoneNumber', value)} />
            <Input label="Address / location" value={form.address} onChangeText={(value) => updateField('address', value)} />
            <Input label="Date of birth" value={form.birthDate} onChangeText={(value) => updateField('birthDate', value)} placeholder="YYYY-MM-DD" />
            <Input label="Gender" value={form.gender} onChangeText={(value) => updateField('gender', value)} />
            <Input label="Relationship status" value={form.relationshipStatus} onChangeText={(value) => updateField('relationshipStatus', value)} />
          </View>
        )}
        <Button title="Save Profile" onPress={saveProfile} loading={saving} />
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
  },
  headerCard: {
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.primary,
  },
  form: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  success: {
    ...typography.body,
    color: colors.success,
    fontWeight: '800',
  },
});

export default EditProfileScreen;
