import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Use any icon library
import { LinearGradient } from 'expo-linear-gradient'; // For gradient background

// Screens
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

// Custom Drawer Content
const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      {/* Drawer Header */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        style={styles.drawerHeader}
      >
        <Image
          source={require('./assets/minh.jpg')} // Replace with your user avatar
          style={styles.avatar}
        />
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>johndoe@example.com</Text>
      </LinearGradient>

      {/* Drawer Items */}
      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          // Handle logout
          props.navigation.navigate('Home');
        }}
      >
        <Icon name="logout" size={24} color="#333333" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

// Patient Drawer
const PatientDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 300,
        },
        drawerActiveTintColor: '#2563EB',
        drawerInactiveTintColor: '#333333',
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: 'white',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          marginLeft: -15,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={PatientHomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Appointment"
        component={Appointment}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="event" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notification"
        component={Notifications}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="notifications" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Therapist Drawer
const TherapistDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 300,
        },
        drawerActiveTintColor: '#2563EB',
        drawerInactiveTintColor: '#333333',
        headerStyle: { backgroundColor: '#2563EB' },
        headerTintColor: 'white',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          marginLeft: -15,
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={TherapistHomeScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileT}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="person" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Appointment"
        component={AppointmentT}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="event" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notification"
        component={Notifications}
        options={{
          drawerIcon: ({ color }) => (
            <Icon name="notifications" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Auth Stack
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

// Main Stack Navigator
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
          component={PatientDrawer}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TherapistDrawer"
          component={TherapistDrawer}
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
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
  },
  drawerItems: {
    flex: 1,
    paddingTop: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginLeft: 15,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333333',
  },
});

export default StackNavigator;