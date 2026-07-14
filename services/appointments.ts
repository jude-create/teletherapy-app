import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notifications';
import type { Appointment, AppointmentStatus, FirestoreDate } from '../types/models';

const APPOINTMENTS_COLLECTION = 'appointments';
const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'pending',
  'approved',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
  'missed',
];

type AppointmentRecord = Appointment & {
  patientId: string;
};

type UpdateAppointmentOptions = {
  notifyTherapist?: boolean;
};

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

const isAppointmentStatus = (status: string): status is AppointmentStatus =>
  APPOINTMENT_STATUSES.includes(status as AppointmentStatus);

const sortAppointments = (appointments: Appointment[]) =>
  appointments.sort(
    (first, second) =>
      normalizeDate(second.updatedAt || second.createdAt || second.appointmentDateTime).getTime() -
      normalizeDate(first.updatedAt || first.createdAt || first.appointmentDateTime).getTime()
  );

const mapAppointment = (snapshot: QueryDocumentSnapshot<DocumentData>): Appointment => ({
  id: snapshot.id,
  ...snapshot.data(),
} as Appointment);

export const saveAppointment = async (patientId: string, appointment: Appointment) => {
  const appointmentDate =
    appointment.appointmentDateTime instanceof Date
      ? appointment.appointmentDateTime
      : normalizeDate(appointment.appointmentDateTime);

  const appointmentRecord: AppointmentRecord = {
    ...appointment,
    patientId,
    appointmentDateTime: appointmentDate,
    status: appointment.status || 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, APPOINTMENTS_COLLECTION), appointmentRecord);

  await Promise.all([
    createNotification({
      userId: appointment.therapistId,
      role: 'therapist',
      type: 'appointment_requested',
      title: 'New appointment request',
      message: `${appointment.patientName || 'A patient'} requested ${formatAppointmentDate(appointmentDate)}.`,
      appointmentId: result.id,
      metadata: { patientId, status: appointmentRecord.status },
    }),
    createNotification({
      userId: patientId,
      role: 'patient',
      type: 'appointment_requested',
      title: 'Appointment request sent',
      message: `Your request with ${appointment.therapistName || 'your therapist'} is waiting for confirmation.`,
      appointmentId: result.id,
      metadata: { therapistId: appointment.therapistId, status: appointmentRecord.status },
    }),
  ]);

  return result.id;
};

export const getAppointmentsForPatient = async (patientId?: string) => {
  if (!patientId) return [];

  const snapshot = await getDocs(
    query(collection(db, APPOINTMENTS_COLLECTION), where('patientId', '==', patientId))
  );

  return sortAppointments(snapshot.docs.map(mapAppointment));
};

export const getAppointmentsForTherapist = async (therapistId?: string) => {
  if (!therapistId) return [];

  const snapshot = await getDocs(
    query(collection(db, APPOINTMENTS_COLLECTION), where('therapistId', '==', therapistId))
  );

  return sortAppointments(snapshot.docs.map(mapAppointment));
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  options: UpdateAppointmentOptions = {}
) => {
  if (!appointmentId) throw new Error('Appointment id is required.');
  if (!isAppointmentStatus(status)) {
    throw new Error('Unsupported appointment status.');
  }
  const normalizedStatus: Exclude<AppointmentStatus, 'confirmed'> =
    status === 'confirmed' ? 'approved' : status;

  const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const snapshot = await getDoc(appointmentRef);
  const appointment = snapshot.exists() ? snapshot.data() : null;

  await updateDoc(appointmentRef, {
    status: normalizedStatus,
    updatedAt: serverTimestamp(),
  });

  if (appointment?.patientId) {
    const patientTitles: Record<string, string> = {
      approved: 'Appointment confirmed',
      rejected: 'Appointment rejected',
      cancelled: 'Appointment cancelled',
      completed: 'Appointment completed',
      missed: 'Appointment marked missed',
      pending: 'Appointment updated',
    };
    const patientMessages: Record<string, string> = {
      approved: `${appointment.therapistName || 'Your therapist'} confirmed ${formatAppointmentDate(appointment.appointmentDateTime)}.`,
      rejected: `${appointment.therapistName || 'Your therapist'} declined this appointment request.`,
      cancelled: `Your appointment with ${appointment.therapistName || 'your therapist'} was cancelled.`,
      completed: `Your appointment with ${appointment.therapistName || 'your therapist'} was marked completed.`,
      missed: `Your appointment with ${appointment.therapistName || 'your therapist'} was marked missed.`,
      pending: `Your appointment with ${appointment.therapistName || 'your therapist'} was updated.`,
    };
    await createNotification({
      userId: appointment.patientId,
      role: 'patient',
      type: `appointment_${normalizedStatus}`,
      title: patientTitles[normalizedStatus] || 'Appointment updated',
      message: patientMessages[normalizedStatus] || patientMessages.pending,
      appointmentId,
      metadata: { therapistId: appointment.therapistId, status: normalizedStatus },
    });
  }

  if (options.notifyTherapist && appointment?.therapistId && normalizedStatus === 'cancelled') {
    await createNotification({
      userId: appointment.therapistId,
      role: 'therapist',
      type: 'appointment_cancelled',
      title: 'Appointment cancelled',
      message: `${appointment.patientName || appointment.patientEmail || 'A patient'} cancelled ${formatAppointmentDate(appointment.appointmentDateTime)}.`,
      appointmentId,
      metadata: { patientId: appointment.patientId, status: normalizedStatus },
    });
  }
};

export const updateAppointmentSessionLink = async (appointmentId: string, sessionLink: string) => {
  if (!appointmentId) throw new Error('Appointment id is required.');

  const trimmedLink = sessionLink.trim();
  if (!/^https?:\/\/\S+\.\S+/.test(trimmedLink)) {
    throw new Error('Enter a valid meeting link that starts with http:// or https://.');
  }

  const appointmentRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const snapshot = await getDoc(appointmentRef);
  const appointment = snapshot.exists() ? snapshot.data() : null;

  await updateDoc(appointmentRef, {
    sessionLink: trimmedLink,
    sessionLinkUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (appointment?.patientId) {
    await createNotification({
      userId: appointment.patientId,
      role: 'patient',
      type: 'session_link_added',
      title: 'Session link ready',
      message: `${appointment.therapistName || 'Your therapist'} added a video link for your appointment.`,
      appointmentId,
      metadata: { therapistId: appointment.therapistId },
    });
  }
};

export const formatAppointmentDate = (value?: FirestoreDate) => {
  const date = normalizeDate(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString();
};
