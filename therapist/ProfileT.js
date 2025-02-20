import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { CameraIcon } from "react-native-heroicons/solid"; 
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";

const ProfileT = () => {
  const navigation = useNavigation();
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

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setSelectedImageUri(imageUri);
        setImageChanged(true);

        const userId = currentUser.uid;
        await setDoc(doc(db, 'therapists', userId), { profileImage: imageUri }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
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

        const therapistsCollectionRef = collection(db, 'therapists');
        const q = query(therapistsCollectionRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
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
    <ScrollView className="flex-1 bg-gray-100 p-5 rounded-2xl w-[400px] m-auto shadow-md">
      {/* Profile Image Section */}
      <View className="justify-center items-center relative">
        <Image
          className="h-36 w-36 border-4 border-gray-300 rounded-full shadow-md"
          source={imageChanged ? { uri: selectedImageUri } : require('../assets/minh.jpg')}
        />
        <TouchableOpacity onPress={pickImage} className="absolute top-24 right-[115px] bg-white p-2 rounded-full shadow-md">
          <CameraIcon size={38} color="#0A75AD" />
        </TouchableOpacity>
      </View>

      {/* User Info */}
      {userData && (
        <View className="mt-5 space-y-4 items-center">
          <Text className="text-2xl font-bold text-gray-900">{userData.name}</Text>
          <Text className="text-lg font-semibold text-gray-600">{userData.email}</Text>

          <View className="flex-row space-x-10">
            <Text className="text-lg">{`📞 ${userData.phone}`}</Text>
            <Text className="text-lg">{`🎂 Age: ${userData.age}`}</Text>
          </View>

          <Text className="text-lg">{`🆔 License No: ${userData.license}`}</Text>

          <View className="w-96 bg-white p-3 rounded-md shadow-md">
            <Text className="text-base text-gray-800">{userData.text}</Text>
          </View>

          {/* Specialities & Profile */}
          <View className="flex-row space-x-8 w-full justify-center">
            <View>
              <Text className="text-lg font-semibold text-blue-500">🛠️ My Specialities:</Text>
              {userData.therapistExperiences?.map((exp, index) => (
                <Text key={index} className="text-sm text-gray-700">• {exp}</Text>
              ))}
            </View>

            <View>
              <Text className="text-lg font-semibold text-blue-500">📌 My Profile:</Text>
              {userData.therapistProfile?.map((profile, index) => (
                <Text key={index} className="text-sm text-gray-700">• {profile}</Text>
              ))}
            </View>
          </View>

          {/* Therapy Type & Appointment Days */}
          <View className="flex-row space-x-12 w-full justify-center">
            <View>
              <Text className="text-lg font-semibold text-blue-500">🧠 Therapy Type:</Text>
              {userData.selectedOption?.map((therapy, index) => (
                <Text key={index} className="text-sm text-gray-700">• {therapy}</Text>
              ))}
            </View>

            <View>
              <Text className="text-lg font-semibold text-blue-500">📅 Appointment Days:</Text>
              {Object.entries(userData.selectedDays || {}).map(([day, selected]) =>
                selected ? <Text key={day} className="text-sm text-gray-700">• {day}</Text> : null
              )}
              <Text className="text-sm text-gray-700">{`⏰ Time: ${userData.time}`}</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Auth", { screen: "SignUpT" })}
            className="mt-5 bg-blue-600 py-3 px-8 rounded-lg shadow-md mb-9"
          >
            <Text className="text-lg font-semibold text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfileT;
