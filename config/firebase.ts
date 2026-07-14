import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_APP_ID,
  REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_MEASUREMENT_ID,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET,
} from '@env';

const cleanEnv = (value?: string) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/,$/, '')
    .trim();

const firebaseConfig = {
  apiKey: cleanEnv(REACT_APP_FIREBASE_API_KEY),
  authDomain: cleanEnv(REACT_APP_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(REACT_APP_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(REACT_APP_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(REACT_APP_FIREBASE_APP_ID),
  measurementId: cleanEnv(REACT_APP_FIREBASE_MEASUREMENT_ID),
};

const missingConfigKeys = Object.entries({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
})
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfigKeys.length) {
  console.warn(`Missing Firebase config values: ${missingConfigKeys.join(', ')}`);
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const createAuth = () => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
};

export const auth = createAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);
export { firebaseConfig };
