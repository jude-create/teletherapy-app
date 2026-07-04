import {
  REACT_APP_GOOGLE_ANDROID_CLIENT_ID,
  REACT_APP_GOOGLE_IOS_CLIENT_ID,
  REACT_APP_GOOGLE_WEB_CLIENT_ID,
} from '@env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

const cleanEnv = (value) =>
  String(value || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/,$/, '')
    .trim();

export const googleClientIds = {
  androidClientId: cleanEnv(REACT_APP_GOOGLE_ANDROID_CLIENT_ID),
  iosClientId: cleanEnv(REACT_APP_GOOGLE_IOS_CLIENT_ID),
  webClientId: cleanEnv(REACT_APP_GOOGLE_WEB_CLIENT_ID),
};

const hasAndroidClientId =
  googleClientIds.androidClientId &&
  googleClientIds.androidClientId !== googleClientIds.webClientId;

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: googleClientIds.webClientId,
    iosClientId: googleClientIds.iosClientId || undefined,
    offlineAccess: false,
  });
};

export const signInWithGoogleAsync = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result?.data?.idToken || result?.idToken;

  if (!idToken) {
    throw new Error('Google did not return a sign-in token.');
  }

  return idToken;
};

export const isGoogleAuthConfigured = Platform.select({
  android: Boolean(hasAndroidClientId && googleClientIds.webClientId),
  ios: Boolean(googleClientIds.iosClientId && googleClientIds.webClientId),
  default: Boolean(googleClientIds.webClientId),
});

export const googleSetupMessage =
  'Google sign-in needs the Android OAuth client ID and Web OAuth client ID in .env, plus google-services.json configured for this app.';
