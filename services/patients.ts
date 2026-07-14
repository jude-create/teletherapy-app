import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';

type PatientProfile = Record<string, unknown> & {
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  relationshipStatus?: string;
  profileImage?: string;
};

type CreatePatientAccountInput = {
  email: string;
  password: string;
  patient: PatientProfile;
};

const withoutUndefined = (value: PatientProfile) =>
  Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined));

export const createPatientAccount = async ({ email, password, patient }: CreatePatientAccountInput) => {
  const authUser = await createUserWithEmailAndPassword(auth, email, password);
  const newPatient = {
    uid: authUser.user.uid,
    role: 'patient',
    createdAt: new Date().toISOString(),
    ...patient,
  };

  await setDoc(doc(db, 'users', authUser.user.uid), {
    uid: authUser.user.uid,
    email,
    role: 'patient',
    createdAt: newPatient.createdAt,
  });
  await setDoc(doc(db, 'patients', authUser.user.uid), newPatient);
  return newPatient;
};

export const getPatientByUid = async (uid: string) => {
  const snapshot = await getDoc(doc(db, 'patients', uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const getPatientByEmail = async (email: string) => {
  const patientsCollectionRef = collection(db, 'patients');
  const q = query(patientsCollectionRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].data();
};

export const updatePatient = async (uid: string, data: PatientProfile) => {
  await Promise.all([
    setDoc(doc(db, 'patients', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true }),
    setDoc(
      doc(db, 'users', uid),
      withoutUndefined({
        name: [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name,
        profileImage: data.profileImage,
        updatedAt: serverTimestamp(),
      }),
      { merge: true }
    ),
  ]);
};

export const savePatientQuestionnaire = updatePatient;
