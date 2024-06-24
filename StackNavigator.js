import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './screens/HomeScreen';
import LogInScreen from './screens/LogInScreen';
import RegisterScreen from './screens/RegisterScreen';
import PatientHomeScreen from './screens/PatientHomeScreen';
import TherapistHomeScreen from './screens/TherapistHomeScreen';
import PatientSignScreen from './screens/PatientSignScreen';
import TherapistSignScreen from './screens/TherapistSignScreen';

import Appointment from './patients/Appointment';
import Notifications from './patients/Notifications';
import Profile from './patients/Profile';
import Questionnaire from './patients/Questionnaire';
import TherapistLoginScreen from './screens/TherapistLoginScreen';
import Questions from './therapist/Questions';
import ProfileT from './therapist/ProfileT';
import MatchTherapist from './patients/MatchTherapist';
import AppointmentT from './therapist/AppointmentT';
import BookAppointment from './patients/BookAppointment';

import AdminLogin from './admin/AdminLogin';
import Admin from './admin/Admin';



const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const PatientDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#6897bb',
          paddingTop: 40,
          paddingHorizontal: 5,
          width: 300,
        },
        drawerActiveTintColor: '#333333',
        drawerInactiveTintColor: '#eeeeee',
        headerStyle: { backgroundColor: '#3399ff' },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="Home" component={PatientHomeScreen} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Appointment" component={Appointment} />
      <Drawer.Screen name="Notification" component={Notifications} />
    </Drawer.Navigator>
  );
};

const TherapistDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#6897bb',
          paddingTop: 40,
          paddingHorizontal: 5,
          width: 300,
        },
        drawerActiveTintColor: '#333333',
        drawerInactiveTintColor: '#eeeeee',
        headerStyle: { backgroundColor: '#3399ff' },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen name="Home" component={TherapistHomeScreen} />
      <Drawer.Screen name="Profile" component={ProfileT} />
      <Drawer.Screen name="Appointment" component={AppointmentT} />
      <Drawer.Screen name="Notification" component={Notifications} />
    </Drawer.Navigator>
  );
};

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LogInScreen} />
      <AuthStack.Screen name="T-Login" component={TherapistLoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="SignUpP" component={PatientSignScreen} />
      <AuthStack.Screen name="SignUpT" component={TherapistSignScreen} />
    </AuthStack.Navigator>
  );
};

const StackNavigator = () => {
 
  return (
    <NavigationContainer>
      <Stack.Navigator>

      <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
       
          <Stack.Screen
            name="PatientDrawer"
            component={ PatientDrawer}
            options={{ headerShown: false }}
          />

<Stack.Screen
            name="TherapistDrawer"
            component={ TherapistDrawer}
            options={{ headerShown: false }}
          />

<Stack.Screen
           name="Match"
           component={MatchTherapist}
           options={{ headerShown: false }}
       />
       
    <Stack.Screen
      name="Questions"
      component={Questions}
      options={{ headerShown: false }}
     />

<Stack.Screen
      name="Question"
      component={Questionnaire}
      options={{ headerShown: false }}
     />
       
       <Stack.Screen
      name="Book"
      component={BookAppointment}
      options={{ headerShown: false }}
     />

<Stack.Screen
      name="admin"
      component={Admin}
      options={{ headerShown: false }}
     /> 


<Stack.Screen
      name="adminLogin"
      component={AdminLogin}
      options={{ headerShown: false }}
     />


      
        
          <>

          <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ headerShown: false }}
            />
          </>
            
          
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;