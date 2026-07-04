import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Admin from '../admin/Admin';

const AdminStack = createNativeStackNavigator();

const AdminNavigator = () => (
  <AdminStack.Navigator screenOptions={{ headerShown: false }}>
    <AdminStack.Screen name="admin" component={Admin} />
  </AdminStack.Navigator>
);

export default AdminNavigator;
