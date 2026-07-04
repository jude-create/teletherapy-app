import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BellIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserIcon,
} from 'react-native-heroicons/solid';
import TherapistHomeScreen from '../screens/TherapistHomeScreen';
import SessionMessages from '../screens/SessionMessages';
import SafetySupportScreen from '../screens/SafetySupportScreen';
import Notifications from '../patients/Notifications';
import Questions from '../therapist/Questions';
import ProfileT from '../therapist/ProfileT';
import AppointmentT from '../therapist/AppointmentT';
import Availability from '../therapist/Availability';
import EditProfileScreen from '../screens/EditProfileScreen';
import BottomTabShell from './BottomTabShell';

const Stack = createNativeStackNavigator();

const therapistTabs = [
  { name: 'Home', label: 'Home', component: TherapistHomeScreen, Icon: SparklesIcon },
  { name: 'Profile', label: 'Profile', component: ProfileT, Icon: UserIcon },
  { name: 'Appointment', label: 'Visits', component: AppointmentT, Icon: CalendarIcon },
  { name: 'Notification', label: 'Alerts', component: Notifications, Icon: BellIcon },
  { name: 'Safety', label: 'Safety', component: SafetySupportScreen, Icon: ExclamationTriangleIcon },
];

export const TherapistTabs = () => <BottomTabShell tabs={therapistTabs} />;

const TherapistNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TherapistDrawer" component={TherapistTabs} />
    <Stack.Screen name="TherapistTabs" component={TherapistTabs} />
    <Stack.Screen name="Appointment" component={AppointmentT} />
    <Stack.Screen name="Availability" component={Availability} />
    <Stack.Screen name="Questions" component={Questions} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="SessionMessages" component={SessionMessages} />
    <Stack.Screen name="SafetySupport" component={SafetySupportScreen} />
  </Stack.Navigator>
);

export default TherapistNavigator;
