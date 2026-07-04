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
import { db } from '../config/firebase';
import { sendPushNotificationToUser } from './pushNotifications';

const NOTIFICATIONS_COLLECTION = 'notifications';

const normalizeDate = (value) => {
  if (!value) return new Date(0);
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

const mapNotification = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export const createNotification = async ({
  userId,
  role,
  type,
  title,
  message,
  appointmentId,
  metadata = {},
}) => {
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

export const getNotificationsForUser = async (userId) => {
  if (!userId) return [];

  const snapshot = await getDocs(
    query(collection(db, NOTIFICATIONS_COLLECTION), where('userId', '==', userId))
  );

  return snapshot.docs
    .map(mapNotification)
    .sort((first, second) => normalizeDate(second.createdAt) - normalizeDate(first.createdAt));
};

export const markNotificationRead = async (notificationId) => {
  if (!notificationId) return;
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    read: true,
    updatedAt: serverTimestamp(),
  });
};
