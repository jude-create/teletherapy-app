import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import { signOutUser } from '../services/auth';

const CustomDrawerContent = (props: any) => {
  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <LinearGradient colors={['#0F3D4A', '#1C5A68']} style={styles.drawerHeader}>
        <Image source={require('../assets/minh.jpg')} style={styles.avatar} />
        <Text style={styles.userName}>VirtualMindSpace</Text>
        <Text style={styles.userEmail}>Online therapy</Text>
      </LinearGradient>

      <View style={styles.drawerItems}>
        <DrawerItemList {...props} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <ArrowSmallLeftIcon size={24} color="#333333" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

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

export default CustomDrawerContent;
