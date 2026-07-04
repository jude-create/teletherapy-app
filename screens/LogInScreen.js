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
import { StatusBar } from 'expo-status-bar';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  googleSetupMessage,
  isGoogleAuthConfigured,
  signInWithGoogleAsync,
} from '../config/googleAuth';
import {
  getFriendlyAuthError,
  signInExistingAccount,
  signInExistingGoogleAccount,
} from '../services/auth';
import { Button, Card, GoogleIcon } from '../components/ui';
import { colors, spacing, typography } from '../theme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LogInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const normalizedEmail = email.trim();

    if (!normalizedEmail) nextErrors.email = 'Email is required.';
    else if (!emailPattern.test(normalizedEmail)) nextErrors.email = 'Enter a valid email address.';
    if (!password.trim()) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (errors[field] || errors.form) {
      setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
    }
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      setErrors({});
      await signInExistingAccount(email.trim().toLowerCase(), password);
    } catch (error) {
      if (error?.needsRoleSelection) {
        navigation.navigate('Register', { googleIdToken: idToken });
        return;
      }
      setErrors({ form: getFriendlyAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGooglePress = async () => {
    if (!isGoogleAuthConfigured) {
      setErrors({ form: googleSetupMessage });
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const idToken = await signInWithGoogleAsync();
      await signInExistingGoogleAccount(idToken);
    } catch (error) {
      setErrors({ form: getFriendlyAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>VirtualMindSpace</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in and we will take you to the right workspace.</Text>
          </View>

          <Card>
            {errors.form ? <Text style={styles.formError}>{errors.form}</Text> : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(value) => updateField('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textSubtle}
                style={[styles.input, errors.email && styles.inputError]}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.passwordInput, errors.password && styles.inputError]}>
                <TextInput
                  value={password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
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

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={submitting}
              disabled={submitting}
            />

            <Button
              title="Continue with Google"
              variant="secondary"
              onPress={handleGooglePress}
              disabled={submitting}
              leftIcon={<GoogleIcon size={22} />}
            />

            <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
              <Text style={styles.linkText}>Create a patient or therapist account</Text>
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
    justifyContent: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
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

export default LogInScreen;
