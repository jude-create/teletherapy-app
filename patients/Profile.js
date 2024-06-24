
import React, { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { View, Text, Image, Button } from 'react-native';
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
  
      const updatedUserData = {
        // ... existing data ...
        profileImage: selectedImageUri,
      };
  
      // Update the user data in the database with the new image URI
      await setDoc(doc(db, 'patients', userId), updatedUserData, { merge: true });
  
      // ... rest of the logic ...
    } catch (error) {
      console.error('Error updating user data:', error.message);
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
   
      // The user picked an image, you can use 'result.uri' to access the image URI.
      setSelectedImageUri(result?.assets[0]?.uri);
    setImageChanged(true);
      console.log(result);
      // Handle the selected image URI as needed.
    
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
        const q = query(patientsCollectionRef, 
          where('email', '==', currentUser.email,
        ));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size > 0) {
          const userData = querySnapshot.docs[0].data();
          setUserData(userData);
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
    <View className="flex-1  space-y-5  rounded-2xl w-[400px] justify-center m-auto shadow-lg shadow-black">
    <View className=" justify-center items-center relative">
     
      <Image className="h-36 w-36 border rounded-full" 
       source= {imageChanged ? { uri: selectedImageUri } : require('../assets/minh.jpg')} />
       <TouchableOpacity 
       onPress={ pickImage}
       className="absolute top-24 right-[119px]">
      <CameraIcon size={38} color="#0A75AD" />
     </TouchableOpacity>
    </View>
   <View className="space-y-3 items-center">
   {userData && (
      <React.Fragment>
      <View className="flex-row space-x-4 ">
        <Text className="text-2xl font-bold">{userData.firstName}</Text>
        <Text className="text-2xl font-bold">{userData.lastName}</Text>
      </View>
 
    <Text className="text-lg font-bold">{userData.email}</Text>
    <Text className="text-lg font-bold">{userData.text}</Text>

    <View className="flex-row space-x-6">
      <Text className="text-lg">{`Phone: ${userData.phoneNumber}`}</Text>
      <Text className="text-lg">{`Date of Birth: ${userData.birthDate}`}</Text>
    </View>
    
    
     
    <View className="flex-row space-x-12">
    <Text className="text-lg">{`Gender:  ${userData.gender}`}</Text>
    <Text className="text-lg">{` Status:  ${userData.relationshipStatus}`}</Text>
    </View>
    
    <View className="items-center pt-2">
      <Text className="italic text-xl text-gray-500"> Preferences</Text>
    </View>

    <View>
      <View className="flex-row space-x-2">
        <Text className="text-base text-blue-500">Type of Therapy:</Text>
        <Text className="text-sm">{userData.selectedOption}</Text>
      </View>

      <View className="items-center pt-3 space-y-2">
        <Text className="text-base text-blue-500">Therapist preferences:</Text>
        {userData.therapistPreferences && userData.therapistPreferences.map((preference, index) => (
        <Text key={index} className="text-sm">{preference}</Text> 
        ))}
      </View>

      <View className="items-center pt-3 space-y-2">
      <Text className="text-base text-blue-500">Therapist with experience in:</Text>
      {userData.therapistExperience && userData.therapistExperience.map((experience, index) => (
        <Text key={index} className="text-sm">{experience}</Text>
        ))}
      </View>
     
    </View>
    </React.Fragment>
    )}
    </View>
   
   </View>
 
  );
};

export default ProfileScreen;