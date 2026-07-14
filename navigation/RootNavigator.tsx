import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { normalizeRole, signOutUser, subscribeToAuthState } from '../services/auth';
import { registerForPushNotifications } from '../services/pushNotifications';
import { getUserProfileWithRetry, isOfflineFirestoreError } from '../services/users';
import type { UserRole } from '../types/models';
import AdminNavigator from './AdminNavigator';
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import TherapistNavigator from './TherapistNavigator';

const authStates = {
  loading: 'loading',
  signedOut: 'signedOut',
  signedIn: 'signedIn',
  profileError: 'profileError',
} as const;

type AuthState = (typeof authStates)[keyof typeof authStates];

const RootNavigator = () => {
  const [authState, setAuthState] = useState<AuthState>(authStates.loading);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [message, setMessage] = useState('');

  const loadUserRole = async (nextUser: User | null) => {
    if (!nextUser) return;

    setAuthState(authStates.loading);
    setMessage('');
    setRole(null);

    try {
      const profile = await getUserProfileWithRetry(nextUser);
      const nextRole = normalizeRole(profile?.role);

      if (!nextRole) {
        setMessage('Your account exists, but no patient, therapist, or admin role was found.');
        setAuthState(authStates.profileError);
        return;
      }

      setRole(nextRole);
      setAuthState(authStates.signedIn);
      registerForPushNotifications({ userId: nextUser.uid, role: nextRole });
    } catch (error) {
      const nextMessage = isOfflineFirestoreError(error)
        ? 'Connect to the internet and try again so we can load your profile.'
        : 'We could not load your profile. Please try again.';

      console.warn('Unable to resolve user role:', error instanceof Error ? error.message : error);
      setMessage(nextMessage);
      setAuthState(authStates.profileError);
    }
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToAuthState((nextUser) => {
      if (!active) return;

      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setMessage('');
        setAuthState(authStates.signedOut);
        return;
      }

      loadUserRole(nextUser);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const renderNavigator = () => {
    if (authState === authStates.loading) {
      return (
        <View style={styles.loadingScreen}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIcon}>
              <SparklesIcon size={28} color="#0F3D4A" />
            </View>
            <Text style={styles.loadingTitle}>Setting up your care space</Text>
            <Text style={styles.loadingText}>Checking your account and opening the right workspace.</Text>
            <ActivityIndicator size="small" color="#0F3D4A" />
          </View>
        </View>
      );
    }

    if (authState === authStates.signedOut) {
      return <AuthNavigator />;
    }

    if (authState === authStates.profileError) {
      return (
        <View style={styles.loadingScreen}>
          <Text style={styles.errorTitle}>Profile unavailable</Text>
          <Text style={styles.errorText}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={() => loadUserRole(user)}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={signOutUser}>
              <Text style={styles.secondaryButtonText}>Sign out</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    if (role === 'patient') {
      return <PatientNavigator />;
    }

    if (role === 'therapist') {
      return <TherapistNavigator />;
    }

    if (role === 'admin') {
      return <AdminNavigator />;
    }

    return <AuthNavigator />;
  };

  return <NavigationContainer>{renderNavigator()}</NavigationContainer>;
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAF8',
    padding: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE7E4',
    backgroundColor: '#FFFFFF',
    padding: 24,
    gap: 12,
  },
  loadingIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: '#D8E8E8',
  },
  loadingTitle: {
    color: '#0F3D4A',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingText: {
    color: '#63727D',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorTitle: {
    color: '#0F3D4A',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    color: '#63727D',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#0F3D4A',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8E3E0',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#0F3D4A',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default RootNavigator;
