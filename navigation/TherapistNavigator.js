import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserIcon,
  UserGroupIcon,
} from 'react-native-heroicons/solid';
import TherapistHomeScreen from '../screens/TherapistHomeScreen';
import SessionMessages from '../screens/SessionMessages';
import Clients from '../therapist/Clients';
import Messages from '../therapist/Messages';
import Questions from '../therapist/Questions';
import ProfileT from '../therapist/ProfileT';
import AppointmentT from '../therapist/AppointmentT';
import Availability from '../therapist/Availability';
import EditProfileScreen from '../screens/EditProfileScreen';
import BottomTabShell from './BottomTabShell';

const Stack = createNativeStackNavigator();

const therapistTabs = [
  { name: 'Home', label: 'Home', component: TherapistHomeScreen, Icon: SparklesIcon },
  { name: 'Clients', label: 'Clients', component: Clients, Icon: UserGroupIcon },
  { name: 'Schedule', label: 'Schedule', component: AppointmentT, Icon: CalendarDaysIcon },
  { name: 'Messages', label: 'Messages', component: Messages, Icon: ChatBubbleLeftRightIcon },
  { name: 'Profile', label: 'Profile', component: ProfileT, Icon: UserIcon },
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
  </Stack.Navigator>
);

export default TherapistNavigator;
