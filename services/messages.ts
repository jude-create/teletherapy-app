import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { DocumentData, FirestoreError, QueryDocumentSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notifications';
import type { Appointment, FirestoreDate, SessionMessage, UserProfile, UserRole } from '../types/models';

const MESSAGES_COLLECTION = 'messages';

type AppointmentMessage = SessionMessage & {
  appointmentId?: string;
  patientId?: string;
  therapistId?: string;
  senderRole?: UserRole | string;
  senderName?: string;
};

type SendAppointmentMessageInput = {
  appointment: Appointment;
  sender: UserProfile;
  text: string;
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

const mapMessage = (snapshot: QueryDocumentSnapshot<DocumentData>): AppointmentMessage => ({
  id: snapshot.id,
  ...snapshot.data(),
} as AppointmentMessage);

export const getMessagesForAppointment = async (appointmentId?: string) => {
  if (!appointmentId) return [];

  const snapshot = await getDocs(
    query(collection(db, MESSAGES_COLLECTION), where('appointmentId', '==', appointmentId))
  );

  return snapshot.docs
    .map(mapMessage)
    .sort((first, second) => normalizeDate(first.createdAt).getTime() - normalizeDate(second.createdAt).getTime());
};

export const subscribeToMessagesForAppointment = (
  appointmentId: string | undefined,
  callback: (messages: AppointmentMessage[]) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe => {
  if (!appointmentId) return () => {};

  const messagesQuery = query(collection(db, MESSAGES_COLLECTION), where('appointmentId', '==', appointmentId));
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map(mapMessage)
          .sort((first, second) => normalizeDate(first.createdAt).getTime() - normalizeDate(second.createdAt).getTime())
      );
    },
    onError
  );
};

export const sendAppointmentMessage = async ({ appointment, sender, text }: SendAppointmentMessageInput) => {
  const trimmed = text.trim();
  if (!appointment?.id) throw new Error('Appointment is required before sending a message.');
  if (!sender?.uid) throw new Error('You need to be signed in to send a message.');
  if (!trimmed) throw new Error('Type a message before sending.');

  const senderRole = sender.role || 'patient';
  const recipientId = senderRole === 'therapist' ? appointment.patientId : appointment.therapistId;
  const recipientRole = senderRole === 'therapist' ? 'patient' : 'therapist';
  const senderName =
    sender.name ||
    sender.displayName ||
    sender.email ||
    (senderRole === 'therapist' ? 'Therapist' : 'Patient');

  const message = {
    appointmentId: appointment.id,
    text: trimmed,
    senderId: sender.uid,
    senderRole,
    senderName,
    patientId: appointment.patientId,
    therapistId: appointment.therapistId,
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, MESSAGES_COLLECTION), message);

  await createNotification({
    userId: recipientId,
    role: recipientRole,
    type: 'appointment_message',
    title: 'New session message',
    message: `${senderName} sent a message about your appointment.`,
    appointmentId: appointment.id,
    metadata: { senderId: sender.uid, senderRole },
  });

  return result.id;
};
