import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { EyeIcon, EyeSlashIcon, ChatBubbleLeftRightIcon, UserIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  googleSetupMessage,
  isGoogleAuthConfigured,
  signInWithGoogleAsync,
} from '../config/googleAuth';
import { createAccountWithRole, createGoogleAccountWithRole, getFriendlyAuthError } from '../services/auth';
import { Button, Card, GoogleIcon } from '../components/ui';
import { colors, spacing, typography } from '../theme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s-]{7,}$/;

type RegisterRole = 'patient' | 'therapist';

type RegisterErrors = {
  name?: string;
  email?: string;
  phone?: string;
  license?: string;
  licenseBoard?: string;
  primarySpecialty?: string;
  yearsExperience?: string;
  bio?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};

type RegisterRoute = {
  name?: string;
  params?: {
    googleIdToken?: string;
  };
};

type RoleSelection = {
  value: RegisterRole;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const roles: RoleSelection[] = [
  {
    value: 'patient',
    title: 'Patient',
    description: 'Find support and book therapy sessions.',
    Icon: UserIcon,
  },
  {
    value: 'therapist',
    title: 'Therapist',
    description: 'Create a provider profile and set availability.',
    Icon: ChatBubbleLeftRightIcon,
  },
];

const RegisterScreen = ({ route }: { route?: RegisterRoute }) => {
  const navigation = useNavigation<AppNavigationProp>();
  const initialRole: RegisterRole = route?.name === 'SignUpT' ? 'therapist' : 'patient';
  const [role, setRole] = useState<RegisterRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [licenseBoard, setLicenseBoard] = useState('');
  const [primarySpecialty, setPrimarySpecialty] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = ({ requireEmailPassword = true } = {}) => {
    const nextErrors: RegisterErrors = {};
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const experienceYears = yearsExperience.trim() ? Number(yearsExperience) : null;

    if (!name.trim()) nextErrors.name = 'Name is required.';
    else if (name.trim().length < 2) nextErrors.name = 'Enter a real name.';
    if (requireEmailPassword && !normalizedEmail) nextErrors.email = 'Email is required.';
    else if (requireEmailPassword && !emailPattern.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (normalizedPhone && !phonePattern.test(normalizedPhone)) {
      nextErrors.phone = 'Enter a valid phone number.';
    }
    if (role === 'therapist' && !license.trim()) {
      nextErrors.license = 'License number is required for therapist accounts.';
    }
    if (role === 'therapist' && !primarySpecialty.trim()) {
      nextErrors.primarySpecialty = 'Add a primary specialty.';
    }
    if (role === 'therapist' && !yearsExperience.trim()) {
      nextErrors.yearsExperience = 'Years of experience is required.';
    }
    if (
      role === 'therapist' &&
      yearsExperience.trim() &&
      (Number.isNaN(experienceYears) || experienceYears < 0 || experienceYears > 70)
    ) {
      nextErrors.yearsExperience = 'Enter valid years of experience.';
    }
    if (role === 'therapist' && bio.trim().length < 40) {
      nextErrors.bio = 'Add a short bio of at least 40 characters.';
    }
    if (requireEmailPassword && !password.trim()) nextErrors.password = 'Password is required.';
    else if (requireEmailPassword && password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    else if (requireEmailPassword && !/[A-Za-z]/.test(password)) {
      nextErrors.password = 'Password must include at least one letter.';
    }
    else if (requireEmailPassword && !/\d/.test(password)) {
      nextErrors.password = 'Password must include at least one number.';
    }
    if (requireEmailPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearFieldError = (field: keyof RegisterErrors) => {
    if (errors[field] || errors.form) {
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    }
  };

  const buildProfile = () => {
    const [firstName, ...lastNameParts] = name.trim().split(' ');
    return role === 'patient'
      ? {
          firstName,
          lastName: lastNameParts.join(' '),
          phoneNumber: phone,
          address: '',
          birthDate: '',
          profileImage: '',
          selectedOption: '',
          gender: '',
          relationshipStatus: '',
          therapistPreferences: [] as string[],
          therapistExperience: [] as string[],
        }
      : {
          name: name.trim(),
          license,
          licenseBoard,
          primarySpecialty,
          yearsExperience,
          phone,
          bio: bio.trim(),
          age: '',
          profileImage: '',
          therapyTypes: [] as string[],
          specialties: primarySpecialty ? [primarySpecialty.trim()] : [],
          preferredPatientGroups: [] as string[],
          selectedOption: [] as string[],
          therapistProfile: [] as string[],
          therapistExperiences: primarySpecialty ? [primarySpecialty.trim()] : [],
          verificationStatus: 'pending',
          onboardingCompleted: false,
        };
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      setErrors({});
      await createAccountWithRole({
        email: email.trim(),
        password,
        role,
        profile: buildProfile(),
      });
    } catch (error) {
      setErrors({ form: getFriendlyAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGooglePress = async () => {
    if (!validate({ requireEmailPassword: false })) return;

    if (!isGoogleAuthConfigured) {
      setErrors({ form: googleSetupMessage });
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const idToken = route?.params?.googleIdToken || await signInWithGoogleAsync();
      await createGoogleAccountWithRole({
        idToken,
        role,
        profile: buildProfile(),
      });
    } catch (error) {
      setErrors({ form: getFriendlyAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>VirtualMindSpace</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Choose your role and we will create the right profile.</Text>
          </View>

          <Card>
            {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

            <View style={styles.roleGrid}>
              {roles.map(({ value, title, description, Icon }) => {
                const selected = role === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setRole(value)}
                    style={[styles.roleCard, selected && styles.roleCardSelected]}
                  >
                    <Icon size={28} color={selected ? colors.primary : colors.textMuted} />
                    <Text style={styles.roleTitle}>{title}</Text>
                    <Text style={styles.roleDescription}>{description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{role === 'patient' ? 'Full name' : 'Professional name'}</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  clearFieldError('name');
                }}
                placeholder="Your name"
                placeholderTextColor={colors.textSubtle}
                style={[styles.input, errors.name && styles.inputError]}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearFieldError('email');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textSubtle}
                style={[styles.input, errors.email && styles.inputError]}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  clearFieldError('phone');
                }}
                keyboardType="phone-pad"
                placeholder="Phone number"
                placeholderTextColor={colors.textSubtle}
                style={styles.input}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            {role === 'therapist' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>License number</Text>
                  <TextInput
                    value={license}
                    onChangeText={(value) => {
                      setLicense(value);
                      clearFieldError('license');
                    }}
                    placeholder="License number"
                    placeholderTextColor={colors.textSubtle}
                    style={[styles.input, errors.license && styles.inputError]}
                  />
                  {errors.license ? <Text style={styles.errorText}>{errors.license}</Text> : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Licensing board / state</Text>
                  <TextInput
                    value={licenseBoard}
                    onChangeText={(value) => {
                      setLicenseBoard(value);
                      clearFieldError('licenseBoard');
                    }}
                    placeholder="Board or state"
                    placeholderTextColor={colors.textSubtle}
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Primary specialty</Text>
                  <TextInput
                    value={primarySpecialty}
                    onChangeText={(value) => {
                      setPrimarySpecialty(value);
                      clearFieldError('primarySpecialty');
                    }}
                    placeholder="Anxiety, trauma, couples therapy..."
                    placeholderTextColor={colors.textSubtle}
                    style={[styles.input, errors.primarySpecialty && styles.inputError]}
                  />
                  {errors.primarySpecialty ? (
                    <Text style={styles.errorText}>{errors.primarySpecialty}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Years of experience</Text>
                  <TextInput
                    value={yearsExperience}
                    onChangeText={(value) => {
                      setYearsExperience(value);
                      clearFieldError('yearsExperience');
                    }}
                    keyboardType="number-pad"
                    placeholder="Years"
                    placeholderTextColor={colors.textSubtle}
                    style={styles.input}
                  />
                  {errors.yearsExperience ? (
                    <Text style={styles.errorText}>{errors.yearsExperience}</Text>
                  ) : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Bio / about</Text>
                  <TextInput
                    value={bio}
                    onChangeText={(value) => {
                      setBio(value);
                      clearFieldError('bio');
                    }}
                    multiline
                    placeholder="Share your approach, clinical background, and who you support."
                    placeholderTextColor={colors.textSubtle}
                    style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
                  />
                  {errors.bio ? <Text style={styles.errorText}>{errors.bio}</Text> : null}
                </View>
              </>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordInput, errors.password && styles.inputError]}>
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearFieldError('password');
                  }}
                  secureTextEntry={!showPassword}
                  placeholder="Create a password"
                  placeholderTextColor={colors.textSubtle}
                  style={styles.passwordTextInput}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
                  {showPassword ? (
                    <EyeSlashIcon size={22} color={colors.textMuted} />
                  ) : (
                    <EyeIcon size={22} color={colors.textMuted} />
                  )}
                </Pressable>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  clearFieldError('confirmPassword');
                }}
                secureTextEntry={!showPassword}
                placeholder="Confirm password"
                placeholderTextColor={colors.textSubtle}
                style={[styles.input, errors.confirmPassword && styles.inputError]}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <Button
              title={`Create ${role === 'patient' ? 'Patient' : 'Therapist'} Account`}
              onPress={handleSignUp}
              loading={submitting}
              disabled={submitting}
            />

            <Button
              title={`Continue with Google as ${role === 'patient' ? 'Patient' : 'Therapist'}`}
              variant="secondary"
              onPress={handleGooglePress}
              disabled={submitting}
              leftIcon={<GoogleIcon size={22} />}
            />

            <Pressable onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </Pressable>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  roleCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  roleTitle: {
    ...typography.subheading,
    color: colors.primary,
  },
  roleDescription: {
    ...typography.small,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    color: colors.text,
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  textArea: {
    minHeight: 112,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  passwordInput: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  passwordTextInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  eyeButton: {
    padding: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  formError: {
    ...typography.small,
    color: colors.danger,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '800',
  },
});

export default RegisterScreen;
