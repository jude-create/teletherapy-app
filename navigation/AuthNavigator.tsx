import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LogInScreen from '../screens/LogInScreen';
import RegisterScreen from '../screens/RegisterScreen';
import type { AuthStackParamList } from '../types/navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Home" component={HomeScreen} />
    <AuthStack.Screen name="Auth" component={AuthFlowNavigator} />
    <AuthStack.Screen name="adminLogin" component={LogInScreen} />
  </AuthStack.Navigator>
);

const AuthFlowStack = createNativeStackNavigator<AuthStackParamList>();

export const AuthFlowNavigator = () => (
  <AuthFlowStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthFlowStack.Screen name="Login" component={LogInScreen} />
    <AuthFlowStack.Screen name="T-Login" component={LogInScreen} />
    <AuthFlowStack.Screen name="Register" component={RegisterScreen} />
    <AuthFlowStack.Screen name="SignUpP" component={RegisterScreen} />
    <AuthFlowStack.Screen name="SignUpT" component={RegisterScreen} />
  </AuthFlowStack.Navigator>
);

export default AuthNavigator;
