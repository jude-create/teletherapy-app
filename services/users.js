import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizeRole } from './auth';

const PROFILE_TIMEOUT_MS = 7000;

const withTimeout = (promise, ms = PROFILE_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timed out while loading your profile.')), ms);
    }),
  ]);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isOfflineFirestoreError = (error) =>
  error?.code === 'unavailable' ||
  /client is offline|offline|network|timed out/i.test(error?.message || '');

const getProfileByEmail = async (email) => {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const usersByEmail = query(
    collection(db, 'users'),
    where('email', '==', normalizedEmail),
    limit(1)
  );
  const usersSnapshot = await getDocs(usersByEmail);

  if (!usersSnapshot.empty) {
    const data = usersSnapshot.docs[0].data();
    return { ...data, uid: data.uid || usersSnapshot.docs[0].id, role: normalizeRole(data.role) };
  }

  const patientsByEmail = query(
    collection(db, 'patients'),
    where('email', '==', normalizedEmail),
    limit(1)
  );
  const patientsSnapshot = await getDocs(patientsByEmail);

  if (!patientsSnapshot.empty) {
    return { ...patientsSnapshot.docs[0].data(), uid: patientsSnapshot.docs[0].id, role: 'patient' };
  }

  const therapistsByEmail = query(
    collection(db, 'therapists'),
    where('email', '==', normalizedEmail),
    limit(1)
  );
  const therapistsSnapshot = await getDocs(therapistsByEmail);

  if (!therapistsSnapshot.empty) {
    return { ...therapistsSnapshot.docs[0].data(), uid: therapistsSnapshot.docs[0].id, role: 'therapist' };
  }

  return null;
};

export const getUserProfile = async (userOrUid) => {
  const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid?.uid;
  const email = typeof userOrUid === 'string' ? null : userOrUid?.email;

  if (!uid && !email) return null;

  if (uid) {
    const userSnapshot = await getDoc(doc(db, 'users', uid));
    if (userSnapshot.exists()) {
      const data = userSnapshot.data();
      return { ...data, uid, role: normalizeRole(data.role) };
    }

    const patientSnapshot = await getDoc(doc(db, 'patients', uid));
    if (patientSnapshot.exists()) {
      return { ...patientSnapshot.data(), uid, role: 'patient' };
    }

    const therapistSnapshot = await getDoc(doc(db, 'therapists', uid));
    if (therapistSnapshot.exists()) {
      return { ...therapistSnapshot.data(), uid, role: 'therapist' };
    }
  }

  return getProfileByEmail(email);
};

export const getUserRole = async (userOrUid) => {
  const profile = await getUserProfile(userOrUid);
  return normalizeRole(profile?.role);
};

export const getUserProfileWithRetry = async (userOrUid, attempts = 3, delayMs = 500) => {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const profile = await withTimeout(getUserProfile(userOrUid));
      if (normalizeRole(profile?.role)) return profile;
    } catch (error) {
      lastError = error;

      if (!isOfflineFirestoreError(error)) {
        throw error;
      }
    }

    if (attempt < attempts - 1) {
      await wait(delayMs);
    }
  }

  if (lastError) throw lastError;
  return null;
};

export const getUserRoleWithRetry = async (userOrUid, attempts, delayMs) => {
  const profile = await getUserProfileWithRetry(userOrUid, attempts, delayMs);
  return normalizeRole(profile?.role);
};
