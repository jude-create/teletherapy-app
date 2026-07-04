import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notifications';

const MESSAGES_COLLECTION = 'messages';

const normalizeDate = (value) => {
  if (!value) return new Date(0);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

const mapMessage = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export const getMessagesForAppointment = async (appointmentId) => {
  if (!appointmentId) return [];

  const snapshot = await getDocs(
    query(collection(db, MESSAGES_COLLECTION), where('appointmentId', '==', appointmentId))
  );

  return snapshot.docs
    .map(mapMessage)
    .sort((first, second) => normalizeDate(first.createdAt) - normalizeDate(second.createdAt));
};

export const subscribeToMessagesForAppointment = (appointmentId, callback, onError) => {
  if (!appointmentId) return () => {};

  const messagesQuery = query(collection(db, MESSAGES_COLLECTION), where('appointmentId', '==', appointmentId));
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      callback(
        snapshot.docs
          .map(mapMessage)
          .sort((first, second) => normalizeDate(first.createdAt) - normalizeDate(second.createdAt))
      );
    },
    onError
  );
};

export const sendAppointmentMessage = async ({ appointment, sender, text }) => {
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
