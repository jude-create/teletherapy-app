import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserIcon,
} from 'react-native-heroicons/solid';
import PatientHomeScreen from '../screens/PatientHomeScreen';
import SessionMessages from '../screens/SessionMessages';
import SafetySupportScreen from '../screens/SafetySupportScreen';
import Appointment from '../patients/Appointment';
import Notifications from '../patients/Notifications';
import Profile from '../patients/Profile';
import Questionnaire from '../patients/Questionnaire';
import MatchTherapist from '../patients/MatchTherapist';
import BookAppointment from '../patients/BookAppointment';
import EditProfileScreen from '../screens/EditProfileScreen';
import BottomTabShell from './BottomTabShell';

const Stack = createNativeStackNavigator();

const patientTabs = [
  { name: 'Home', label: 'Home', component: PatientHomeScreen, Icon: SparklesIcon },
  { name: 'Profile', label: 'Profile', component: Profile, Icon: UserIcon },
  { name: 'Appointment', label: 'Visits', component: Appointment, Icon: CalendarIcon },
  { name: 'Notification', label: 'Alerts', component: Notifications, Icon: BellIcon },
  { name: 'Safety', label: 'Safety', component: SafetySupportScreen, Icon: ExclamationTriangleIcon },
];

export const PatientTabs = () => <BottomTabShell tabs={patientTabs} />;

const PatientNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PatientDrawer" component={PatientTabs} />
    <Stack.Screen name="PatientTabs" component={PatientTabs} />
    <Stack.Screen name="Match" component={MatchTherapist} />
    <Stack.Screen name="Question" component={Questionnaire} />
    <Stack.Screen name="Book" component={BookAppointment} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="SessionMessages" component={SessionMessages} />
    <Stack.Screen name="SafetySupport" component={SafetySupportScreen} />
  </Stack.Navigator>
);

export default PatientNavigator;
