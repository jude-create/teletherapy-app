import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notifications';
import type { FirestoreDate } from '../types/models';

type AdminRecord = Record<string, unknown> & {
  id?: string;
  uid?: string;
  status?: string;
  verificationStatus?: string;
  verified?: boolean;
  sessionLink?: string;
  updatedAt?: FirestoreDate;
  createdAt?: FirestoreDate;
  appointmentDateTime?: FirestoreDate;
};
type VerificationStatus = 'approved' | 'rejected' | 'pending';

const mapDoc = (snapshot: QueryDocumentSnapshot<DocumentData>): AdminRecord => ({
  id: snapshot.id,
  ...snapshot.data(),
});

const hasToDate = (value: FirestoreDate): value is { toDate: () => Date } =>
  typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function';

const normalizeDate = (value?: FirestoreDate) => {
  if (!value) return new Date(0);
  if (hasToDate(value)) return value.toDate();
  if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  return new Date(0);
};

const countByStatus = (items: AdminRecord[], getStatus: (item: AdminRecord) => string | undefined) =>
  items.reduce((result, item) => {
    const status = getStatus(item) || 'unknown';
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {} as Record<string, number>);

export const getAdminDashboard = async () => {
  const [therapistsSnapshot, patientsSnapshot, appointmentsSnapshot] = await Promise.all([
    getDocs(collection(db, 'therapists')),
    getDocs(collection(db, 'patients')),
    getDocs(collection(db, 'appointments')),
  ]);

  const therapists = therapistsSnapshot.docs.map(mapDoc);
  const patients = patientsSnapshot.docs.map(mapDoc);
  const appointments = appointmentsSnapshot.docs.map(mapDoc);
  const appointmentStatusCounts = countByStatus(appointments, (appointment) => appointment.status || 'pending');
  const verificationStatusCounts = countByStatus(
    therapists,
    (therapist) => therapist.verificationStatus || (therapist.verified ? 'approved' : 'pending')
  );
  const approvedAppointments =
    (appointmentStatusCounts.approved || 0) + (appointmentStatusCounts.confirmed || 0);
  const completedAppointments = appointmentStatusCounts.completed || 0;
  const sessionLinksReady = appointments.filter((appointment) => Boolean(appointment.sessionLink)).length;
  const recentAppointments = [...appointments]
    .sort(
      (first, second) =>
        normalizeDate(second.updatedAt || second.createdAt || second.appointmentDateTime).getTime() -
        normalizeDate(first.updatedAt || first.createdAt || first.appointmentDateTime).getTime()
    )
    .slice(0, 5);

  return {
    therapists,
    patients,
    appointments,
    appointmentStatusCounts,
    verificationStatusCounts,
    recentAppointments,
    stats: {
      therapists: therapists.length,
      patients: patients.length,
      pendingTherapists: verificationStatusCounts.pending || 0,
      approvedTherapists: verificationStatusCounts.approved || 0,
      rejectedTherapists: verificationStatusCounts.rejected || 0,
      totalAppointments: appointments.length,
      pendingAppointments: appointmentStatusCounts.pending || 0,
      approvedAppointments,
      rejectedAppointments: appointmentStatusCounts.rejected || 0,
      cancelledAppointments: appointmentStatusCounts.cancelled || 0,
      completedAppointments,
      missedAppointments: appointmentStatusCounts.missed || 0,
      sessionLinksReady,
    },
  };
};

export const updateTherapistVerification = async ({
  therapist,
  status,
}: {
  therapist: AdminRecord;
  status: VerificationStatus;
}) => {
  if (!therapist?.id) throw new Error('Therapist profile is required.');
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw new Error('Unsupported verification status.');
  }

  const verified = status === 'approved';
  const update = {
    verified,
    verificationStatus: status,
    verifiedAt: verified ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  };

  await Promise.all([
    setDoc(doc(db, 'therapists', therapist.id), update, { merge: true }),
    setDoc(doc(db, 'users', therapist.uid || therapist.id), update, { merge: true }),
  ]);

  await createNotification({
    userId: therapist.uid || therapist.id,
    role: 'therapist',
    type: `therapist_${status}`,
    title: verified ? 'Profile approved' : status === 'rejected' ? 'Profile needs updates' : 'Profile review pending',
    message: verified
      ? 'Your therapist profile has been approved and can now appear in patient matching.'
      : status === 'rejected'
        ? 'Your therapist profile was not approved yet. Review your license and professional details.'
        : 'Your therapist profile is back in the admin review queue.',
    metadata: { verificationStatus: status },
  });
};
