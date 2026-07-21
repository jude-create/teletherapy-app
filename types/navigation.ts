import type { NavigationProp } from '@react-navigation/native';
import type { Appointment } from './models';

export type AuthStackParamList = {
  Home: undefined;
  Auth:
    | {
        screen?: keyof AuthStackParamList;
      }
    | undefined;
  adminLogin: undefined;
  Login: undefined;
  'T-Login': undefined;
  Register:
    | {
        googleIdToken?: string;
      }
    | undefined;
  SignUpP:
    | {
        googleIdToken?: string;
      }
    | undefined;
  SignUpT:
    | {
        googleIdToken?: string;
      }
    | undefined;
};

export type PatientStackParamList = {
  PatientDrawer: undefined;
  PatientTabs: undefined;
  Match: undefined;
  Question: undefined;
  Book:
    | {
        therapistId?: string;
        therapistName?: string;
        therapist?: Record<string, unknown>;
      }
    | undefined;
  EditProfile: undefined;
  SessionMessages:
    | {
        appointment?: Appointment;
        sessionId?: string;
        recipientId?: string;
        recipientName?: string;
      }
    | undefined;
  VideoSession:
    | {
        appointment?: Appointment;
      }
    | undefined;
  SafetySupport: undefined;
};

export type TherapistStackParamList = {
  TherapistDrawer: undefined;
  TherapistTabs: undefined;
  Appointment: undefined;
  Availability: undefined;
  Questions: undefined;
  EditProfile: undefined;
  SessionMessages:
    | {
        appointment?: Appointment;
        sessionId?: string;
        recipientId?: string;
        recipientName?: string;
      }
    | undefined;
  VideoSession:
    | {
        appointment?: Appointment;
      }
    | undefined;
};

export type AdminStackParamList = {
  admin: undefined;
};

export type AppNavigationParamList = AuthStackParamList &
  PatientStackParamList &
  TherapistStackParamList &
  AdminStackParamList;

export type AppNavigationProp = NavigationProp<AppNavigationParamList>;
