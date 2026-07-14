import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendPushNotificationToUser } from './pushNotifications';
import type { AppNotification, FirestoreDate } from '../types/models';

const NOTIFICATIONS_COLLECTION = 'notifications';

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

const mapNotification = (snapshot: QueryDocumentSnapshot<DocumentData>): AppNotification => ({
  id: snapshot.id,
  ...snapshot.data(),
} as AppNotification);

export const createNotification = async ({
  userId,
  role,
  type,
  title,
  message,
  appointmentId,
  metadata = {},
}: AppNotification) => {
  if (!userId) return null;

  const notification = {
    userId,
    role: role || '',
    type,
    title,
    message,
    appointmentId: appointmentId || '',
    metadata,
    read: false,
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);

  await sendPushNotificationToUser({
    userId,
    title,
    message,
    data: {
      notificationId: result.id,
      appointmentId: appointmentId || '',
      type,
      ...metadata,
    },
  });

  return result.id;
};

export const getNotificationsForUser = async (userId?: string) => {
  if (!userId) return [];

  const snapshot = await getDocs(
    query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId))
  );

  return snapshot.docs
    .map(mapNotification)
    .sort((first, second) => normalizeDate(second.createdAt).getTime() - normalizeDate(first.createdAt).getTime());
};

export const markNotificationRead = async (notificationId?: string) => {
  if (!notificationId) return;
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  });
};
