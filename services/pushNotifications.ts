import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserRole } from '../types/models';

const getProjectId = () =>
  Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

const savePushRegistrationStatus = async (
  userId: string,
  role: UserRole | string | undefined,
  data: Record<string, unknown>
) => {
  await setDoc(doc(db, 'users', userId), data, { merge: true });
  if (role === 'patient' || role === 'therapist') {
    await setDoc(doc(db, `${role}s`, userId), data, { merge: true });
  }
};

export const configurePushNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

type RegisterPushInput = {
  userId?: string;
  role?: UserRole | string;
};

type SendExpoPushInput = {
  to?: string | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type SendUserPushInput = {
  userId?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
};

export const registerForPushNotifications = async ({ userId, role }: RegisterPushInput) => {
  if (!userId) return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0F3D4A',
      });
    }

    const existingPermission = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermission.status;

    if (finalStatus !== 'granted') {
      const requestedPermission = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermission.status;
    }

    if (finalStatus !== 'granted') {
      await savePushRegistrationStatus(userId, role, {
        pushPermissionStatus: finalStatus,
        pushRegistrationError: 'Notification permission was not granted.',
        pushTokenUpdatedAt: serverTimestamp(),
      });
      return null;
    }

    const projectId = getProjectId();
    if (!projectId) {
      await savePushRegistrationStatus(userId, role, {
        pushPermissionStatus: finalStatus,
        pushRegistrationError: 'Expo projectId was not found.',
        pushTokenUpdatedAt: serverTimestamp(),
      });
      console.warn('Expo projectId was not found. Push token registration skipped.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const tokenData = {
      expoPushToken: token,
      pushPermissionStatus: finalStatus,
      pushRegistrationError: '',
      pushTokenUpdatedAt: serverTimestamp(),
    };

    await savePushRegistrationStatus(userId, role, tokenData);

    return token;
  } catch (error) {
    console.warn('Unable to register for push notifications:', error instanceof Error ? error.message : error);
    return null;
  }
};

export const sendExpoPushNotification = async ({ to, title, body, data = {} }: SendExpoPushInput) => {
  const token = String(to || '');
  if (!token.startsWith('ExponentPushToken') && !token.startsWith('ExpoPushToken')) return null;

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        sound: 'default',
        title,
        body,
        data,
      }),
    });

    const result = await response.json();
    const errors = Array.isArray(result?.data)
      ? result.data.filter((item: { status?: string }) => item?.status === 'error')
      : result?.data?.status === 'error'
        ? [result.data]
        : [];

    if (!response.ok || errors.length) {
      console.warn('Expo push notification failed:', result);
      return null;
    }

    return result;
  } catch (error) {
    console.warn('Unable to send Expo push notification:', error instanceof Error ? error.message : error);
    return null;
  }
};

export const sendPushNotificationToUser = async ({
  userId,
  title,
  message,
  data = {},
}: SendUserPushInput) => {
  if (!userId) return null;

  try {
    const snapshot = await getDoc(doc(db, 'users', userId));
    const expoPushToken = snapshot.exists() ? snapshot.data()?.expoPushToken : null;

    return sendExpoPushNotification({
      to: expoPushToken,
      title,
      body: message,
      data,
    });
  } catch (error) {
    console.warn('Unable to look up push recipient:', error instanceof Error ? error.message : error);
    return null;
  }
};
