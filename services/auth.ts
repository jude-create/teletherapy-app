import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserProfile, UserRole } from '../types/models';

const VALID_ROLES: UserRole[] = ['patient', 'therapist', 'admin'];

type RoleSelectionError = Error & {
  needsRoleSelection?: boolean;
  code?: string;
};

type AccountProfile = Record<string, unknown> & {
  name?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  therapyTypes?: unknown;
  selectedOption?: unknown;
  specialties?: unknown;
  therapistExperiences?: unknown;
  preferredPatientGroups?: unknown;
  therapistProfile?: unknown;
};

type CreateAccountInput = {
  email: string;
  password: string;
  role: string;
  profile?: AccountProfile;
};

type CreateGoogleAccountInput = {
  idToken: string;
  role: string;
  profile?: AccountProfile;
};

export const normalizeRole = (role: unknown): UserRole | null => {
  const nextRole = String(role || '').toLowerCase().trim();
  return VALID_ROLES.includes(nextRole as UserRole) ? (nextRole as UserRole) : null;
};

export const getCurrentUser = () => auth.currentUser;

export const subscribeToAuthState = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const signIn = async (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

export const signOutUser = () => signOut(auth);

const requireExistingProfile = async (user: User): Promise<UserProfile> => {
  const profile = await getAuthProfile(user);
  const role = normalizeRole(profile?.role);

  if (!role) {
    await signOut(auth);
    const error: RoleSelectionError = new Error(
      'No account profile was found for this sign-in. Please choose a role.'
    );
    error.needsRoleSelection = true;
    throw error;
  }

  return profile;
};

const getAuthProfileByEmail = async (email?: string | null): Promise<UserProfile | null> => {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const usersSnapshot = await getDocs(
    query(collection(db, 'users'), where('email', '==', normalizedEmail), limit(1))
  );
  if (!usersSnapshot.empty) return usersSnapshot.docs[0].data();

  const patientsSnapshot = await getDocs(
    query(collection(db, 'patients'), where('email', '==', normalizedEmail), limit(1))
  );
  if (!patientsSnapshot.empty) return { ...patientsSnapshot.docs[0].data(), role: 'patient' };

  const therapistsSnapshot = await getDocs(
    query(collection(db, 'therapists'), where('email', '==', normalizedEmail), limit(1))
  );
  if (!therapistsSnapshot.empty) return { ...therapistsSnapshot.docs[0].data(), role: 'therapist' };

  return null;
};

const getAuthProfile = async (user: User): Promise<UserProfile | null> => {
  if (!user?.uid && !user?.email) return null;

  if (user.uid) {
    const userSnapshot = await getDoc(doc(db, 'users', user.uid));
    if (userSnapshot.exists()) return userSnapshot.data();

    const patientSnapshot = await getDoc(doc(db, 'patients', user.uid));
    if (patientSnapshot.exists()) return { ...patientSnapshot.data(), role: 'patient' };

    const therapistSnapshot = await getDoc(doc(db, 'therapists', user.uid));
    if (therapistSnapshot.exists()) return { ...therapistSnapshot.data(), role: 'therapist' };
  }

  return getAuthProfileByEmail(user.email);
};

export const signInExistingAccount = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await requireExistingProfile(credential.user);
  return credential;
};

export const signInWithGoogleIdToken = async (idToken: string) => {
  if (!idToken) throw new Error('Google did not return a sign-in token.');
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};

export const signInExistingGoogleAccount = async (idToken: string) => {
  const credential = await signInWithGoogleIdToken(idToken);
  await requireExistingProfile(credential.user);
  return credential;
};

export const getFriendlyAuthError = (error: RoleSelectionError | null | undefined) => {
  switch (error?.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'permission-denied':
      return 'We could not save your profile because of Firestore permissions.';
    default:
      if (/No account profile was found/i.test(error?.message || '')) {
        return 'Choose whether this Google account is for a patient or therapist profile.';
      }
      return error?.message || 'Something went wrong. Please try again.';
  }
};

export const createAccountWithRole = async ({ email, password, role, profile = {} }: CreateAccountInput) => {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole || normalizedRole === 'admin') {
    throw new Error('Choose either Patient or Therapist before creating an account.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const { uid } = credential.user;
  const displayName = profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ');

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  const baseProfile = {
    uid,
    email: normalizedEmail,
    role: normalizedRole,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const verificationProfile =
    normalizedRole === 'therapist'
      ? {
          verified: false,
          verificationStatus: 'pending',
        }
      : {};

  await setDoc(doc(db, 'users', uid), {
    ...baseProfile,
    ...verificationProfile,
    name: displayName || '',
  });

  const collectionName = normalizedRole === 'patient' ? 'patients' : 'therapists';
  await setDoc(doc(db, collectionName, uid), {
    ...baseProfile,
    ...verificationProfile,
    ...profile,
    ...(normalizedRole === 'therapist'
      ? {
          therapyTypes: profile.therapyTypes || profile.selectedOption || [],
          specialties: profile.specialties || profile.therapistExperiences || [],
          preferredPatientGroups: profile.preferredPatientGroups || profile.therapistProfile || [],
          onboardingCompleted: false,
        }
      : {}),
  });

  return { uid, email: normalizedEmail, role: normalizedRole };
};

export const createGoogleAccountWithRole = async ({
  idToken,
  role,
  profile = {},
}: CreateGoogleAccountInput) => {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole || normalizedRole === 'admin') {
    throw new Error('Choose either Patient or Therapist before creating an account.');
  }

  const credential = await signInWithGoogleIdToken(idToken);
  const { uid, email, displayName, photoURL } = credential.user;
  const normalizedEmail = email?.trim().toLowerCase();
  const profileName = profile.name || displayName || '';
  const baseProfile = {
    uid,
    email: normalizedEmail,
    role: normalizedRole,
    provider: 'google',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const verificationProfile =
    normalizedRole === 'therapist'
      ? {
          verified: false,
          verificationStatus: 'pending',
        }
      : {};

  await setDoc(
    doc(db, 'users', uid),
    {
      ...baseProfile,
      ...verificationProfile,
      name: profileName,
    },
    { merge: true }
  );

  const collectionName = normalizedRole === 'patient' ? 'patients' : 'therapists';
  await setDoc(
    doc(db, collectionName, uid),
    {
      ...baseProfile,
      ...verificationProfile,
      ...profile,
      name: profileName,
      profileImage: photoURL || profile.profileImage || '',
      ...(normalizedRole === 'therapist'
        ? {
            therapyTypes: profile.therapyTypes || profile.selectedOption || [],
            specialties: profile.specialties || profile.therapistExperiences || [],
            preferredPatientGroups: profile.preferredPatientGroups || profile.therapistProfile || [],
            onboardingCompleted: false,
          }
        : {}),
    },
    { merge: true }
  );

  return { uid, email: normalizedEmail, role: normalizedRole };
};
