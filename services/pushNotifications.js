import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const getProjectId = () =>
  Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

export const configurePushNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const registerForPushNotifications = async ({ userId, role }) => {
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

    if (finalStatus !== 'granted') return null;

    const projectId = getProjectId();
    if (!projectId) {
      console.warn('Expo projectId was not found. Push token registration skipped.');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const tokenData = {
      expoPushToken: token,
      pushTokenUpdatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', userId), tokenData, { merge: true });
    if (role === 'patient' || role === 'therapist') {
      await setDoc(doc(db, `${role}s`, userId), tokenData, { merge: true });
    }

    return token;
  } catch (error) {
    console.warn('Unable to register for push notifications:', error.message);
    return null;
  }
};

export const sendExpoPushNotification = async ({ to, title, body, data = {} }) => {
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

    return response.json();
  } catch (error) {
    console.warn('Unable to send Expo push notification:', error.message);
    return null;
  }
};

export const sendPushNotificationToUser = async ({ userId, title, message, data = {} }) => {
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
    console.warn('Unable to look up push recipient:', error.message);
    return null;
  }
};
