import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { getSlotsFromTherapist } from './availability';
import type { AvailabilitySlot } from '../types/models';

type TherapistProfile = Record<string, unknown> & {
  id?: string;
  uid?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  role?: string;
  verified?: boolean;
  verificationStatus?: string;
  therapyTypes?: unknown;
  selectedOption?: unknown;
  specialties?: unknown;
  therapistExperiences?: unknown;
  preferredPatientGroups?: unknown;
  therapistProfile?: unknown;
  availabilitySlots?: AvailabilitySlot[];
  yearsExperience?: unknown;
  experienceYears?: unknown;
  bio?: unknown;
  text?: unknown;
};

type NormalizedTherapistProfile = TherapistProfile & {
  therapyTypes: unknown[];
  specialties: unknown[];
  preferredPatientGroups: unknown[];
  selectedOption: unknown[];
  therapistExperiences: unknown[];
  therapistProfile: unknown[];
};

type CreateTherapistAccountInput = {
  email: string;
  password: string;
  therapist: TherapistProfile;
};

const toArray = (value: unknown) => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
};

const withoutUndefined = (value: TherapistProfile) =>
  Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));

export const normalizeTherapistProfile = (
  therapist: TherapistProfile = {},
  id?: string
): NormalizedTherapistProfile => {
  const therapyTypes = toArray(therapist.therapyTypes || therapist.selectedOption);
  const specialties = toArray(therapist.specialties || therapist.therapistExperiences);
  const preferredPatientGroups = toArray(
    therapist.preferredPatientGroups || therapist.therapistProfile
  );

  return {
    ...therapist,
    id: id || therapist.id || therapist.uid,
    uid: therapist.uid || id,
    therapyTypes,
    specialties,
    preferredPatientGroups,
    selectedOption: therapyTypes,
    therapistExperiences: specialties,
    therapistProfile: preferredPatientGroups,
    yearsExperience: therapist.yearsExperience || therapist.experienceYears || '',
    bio: therapist.bio || therapist.text || '',
  };
};

export const isTherapistBookable = (therapist: TherapistProfile = {}) => {
  const normalized = normalizeTherapistProfile(therapist);
  return Boolean(
    normalized.name &&
      (normalized.bio || normalized.therapyTypes.length || normalized.specialties.length) &&
      getSlotsFromTherapist(normalized).length
  );
};

export const isTherapistVisible = (therapist: TherapistProfile = {}) => {
  const normalized = normalizeTherapistProfile(therapist);
  return Boolean(
    normalized.role === 'therapist' ||
      normalized.name ||
      normalized.email ||
      normalized.therapyTypes.length ||
      normalized.specialties.length
  );
};

export const createTherapistAccount = async ({
  email,
  password,
  therapist,
}: CreateTherapistAccountInput) => {
  const normalizedEmail = email.trim().toLowerCase();
  const authUser = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const uid = authUser.user.uid;
  const displayName = therapist.name || '';
  const now = serverTimestamp();
  const normalizedTherapist = normalizeTherapistProfile({
    ...therapist,
    uid,
    email: normalizedEmail,
    role: 'therapist',
    verified: false,
    verificationStatus: 'pending',
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
  });

  if (displayName) {
    await updateProfile(authUser.user, { displayName });
  }

  await setDoc(doc(db, 'users', uid), {
    uid,
    email: normalizedEmail,
    role: 'therapist',
    name: displayName,
    verified: false,
    verificationStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  });
  await setDoc(doc(db, 'therapists', uid), normalizedTherapist);
  return normalizedTherapist;
};

export const getTherapistByUid = async (uid?: string) => {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, 'therapists', uid));
  return snapshot.exists() ? normalizeTherapistProfile(snapshot.data(), snapshot.id) : null;
};

export const getTherapistByEmail = async (email?: string) => {
  if (!email) return null;
  const q = query(collection(db, 'therapists'), where('email', '==', email.trim().toLowerCase()));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty
    ? null
    : normalizeTherapistProfile(querySnapshot.docs[0].data(), querySnapshot.docs[0].id);
};

export const findTherapistsByTherapyType = async (therapyType?: string) => {
  const therapistsCollectionRef = collection(db, 'therapists');
  const querySnapshot = await getDocs(therapistsCollectionRef);

  return querySnapshot.docs
    .map((therapistDoc) => normalizeTherapistProfile(therapistDoc.data(), therapistDoc.id))
    .filter((therapist) => {
      const notRejected = therapist.verificationStatus !== 'rejected';
      return notRejected && isTherapistVisible(therapist);
    });
};

export const updateTherapist = async (uid: string, data: TherapistProfile) => {
  if (!uid) throw new Error('Therapist id is required.');
  const normalized = normalizeTherapistProfile(data);
  const update: TherapistProfile = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.therapyTypes !== undefined || data.selectedOption !== undefined) {
    update.therapyTypes = normalized.therapyTypes;
    update.selectedOption = normalized.therapyTypes;
  }
  if (data.specialties !== undefined || data.therapistExperiences !== undefined) {
    update.specialties = normalized.specialties;
    update.therapistExperiences = normalized.specialties;
  }
  if (data.preferredPatientGroups !== undefined || data.therapistProfile !== undefined) {
    update.preferredPatientGroups = normalized.preferredPatientGroups;
    update.therapistProfile = normalized.preferredPatientGroups;
  }

  await Promise.all([
    setDoc(doc(db, 'therapists', uid), withoutUndefined(update), { merge: true }),
    setDoc(
      doc(db, 'users', uid),
      withoutUndefined({
        name: data.name,
        profileImage: data.profileImage,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ),
  ]);
};

export const updateTherapistAvailability = async (uid: string, data: TherapistProfile) => {
  await updateTherapist(uid, {
    ...data,
    availabilityUpdatedAt: serverTimestamp(),
  });
};

export const saveTherapistQuestionnaire = async (uid: string, data: TherapistProfile) =>
  updateTherapist(uid, {
    ...data,
    onboardingCompleted: true,
    profileCompleted: true,
  });
