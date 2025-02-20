import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { View, Text, Image } from 'react-native';
import { auth, db } from '../config/firebase';
import { CameraIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('No authenticated user');
        return;
      }

      const userId = currentUser.uid;
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImageUri(result?.assets[0]?.uri);
        setImageChanged(true);

        const updatedUserData = { profileImage: result.assets[0].uri };
        await setDoc(doc(db, 'patients', userId), updatedUserData, { merge: true });

        console.log('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile image:', error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.warn('No authenticated user');
          return;
        }
  
        const patientsCollectionRef = collection(db, 'patients');
        const q = query(patientsCollectionRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.size > 0) {
          setUserData(querySnapshot.docs[0].data());
        } else {
          console.warn('No user data found for the authenticated user');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };
    fetchUserData();
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6">
      {/* Profile Image Section */}
      <View className="items-center">
        <View className="relative">
          <Image
            className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-md"
            source={imageChanged ? { uri: selectedImageUri } : require('../assets/minh.jpg')}
          />
          <TouchableOpacity onPress={pickImage} className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
            <CameraIcon size={28} color="#0A75AD" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Info Section */}
      {userData && (
        <View className="mt-6 bg-white p-4 rounded-lg shadow-lg space-y-3">
          {/* Name & Email */}
          <View className="items-center space-y-1">
            <Text className="text-2xl font-bold text-gray-800">
              {userData.firstName} {userData.lastName}
            </Text>
            <Text className="text-lg text-gray-600">{userData.email}</Text>
          </View>

          {/* Contact Info */}
          <View className="mt-4 border-t border-gray-300 pt-3">
            <Text className="text-lg font-semibold text-blue-600">Contact Info:</Text>
            <Text className="text-gray-700">{`📞 Phone: ${userData.phoneNumber}`}</Text>
            <Text className="text-gray-700">{`🎂 Date of Birth: ${userData.birthDate}`}</Text>
          </View>

          {/* Additional Details */}
          <View className="mt-4 border-t border-gray-300 pt-3">
            <Text className="text-lg font-semibold text-blue-600">Personal Details:</Text>
            <Text className="text-gray-700">{`👤 Gender: ${userData.gender}`}</Text>
            <Text className="text-gray-700">{`💑 Relationship Status: ${userData.relationshipStatus}`}</Text>
          </View>

          {/* Preferences */}
          <View className="mt-4 border-t border-gray-300 pt-3 pb-6">
            <Text className="text-lg font-semibold text-blue-600">Therapy Preferences:</Text>
            <Text className="text-gray-700">{`🛋️ Type of Therapy: ${userData.selectedOption}`}</Text>
            <Text className="text-gray-700">{`💡 Therapist Preferences:`}</Text>
            {userData.therapistPreferences &&
              userData.therapistPreferences.map((preference, index) => (
                <Text key={index} className="text-gray-700">- {preference}</Text>
              ))}
            <Text className="text-gray-700">{`📚 Experience in:`}</Text>
            {userData.therapistExperience &&
              userData.therapistExperience.map((experience, index) => (
                <Text key={index} className="text-gray-700">- {experience}</Text>
              ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
