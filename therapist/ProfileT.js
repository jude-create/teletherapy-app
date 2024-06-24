import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { CameraIcon } from "react-native-heroicons/solid"; 
import { Image } from 'react-native'
import { auth, db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
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
    console.log(result.uri);
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
    
        const therapistsCollectionRef = collection(db, 'therapists');
        const q = query(therapistsCollectionRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.size > 0) {
          const userData = querySnapshot.docs[0].data();
          setUserData(userData);
          
        } else {
          console.warn('No user data found for the authenticated user');
        }
        console.log(userData);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };
    fetchUserData();
  }, []);  

  

  
  return (
    <ScrollView 
      centerContent
    className="flex-1  space-y-5  rounded-2xl w-[400px]  m-auto shadow-lg shadow-black">
    <View className=" justify-center items-center relative">
     
      <Image className="h-36 w-36 border rounded-full" 
       source= {imageChanged ? { uri: selectedImageUri } : require('../assets/minh.jpg')} />
       <TouchableOpacity 
       onPress={ pickImage}
       className="absolute top-24 right-[119px]">
      <CameraIcon size={38} color="#0A75AD" />
     </TouchableOpacity>
    </View>
   
 <View className="space-y-6 items-center">
 {userData && (
      <React.Fragment >
   <View className="space-y-4 items-center">
    <View>
      <Text className="text-xl font-bold">{userData.name}</Text>
     
    </View>

  <Text className="text-base font-bold">{userData.email}</Text>

  <View className="flex-row space-x-10">
    <Text className="text-base">{`Phone: ${userData.phone}`}</Text>
    <Text className="text-base">{`Age: ${userData.age}`}</Text>
  </View>

  <View>
     <Text className="text-base">{`License no: ${userData.license}`}</Text>
   </View>

 

  <View className=" w-64">
    <Text className="text-base">{userData.text}</Text>
  </View>

  <View className="flex-row space-x-8 mb-2 mt-4">
   <View className="space-y-2">
     <Text className="text-base text-blue-500"> My Specialities:</Text>
     {userData.therapistExperiences && userData.therapistExperiences.map((experience, index) => (
        <Text key={index} className="text-sm">{experience}</Text> 
        ))}
   </View>

   <View>
   <Text className="text-base text-blue-500">My Profile </Text>
   {userData.therapistProfile && userData.therapistProfile.map((profile, index) => (
        <Text key={index} className="text-sm">{profile}</Text> 
        ))}
  </View>

  </View>

<View className="flex-row space-x-16 mb-4 ">
  <View>
    <Text className="text-base text-blue-500">Type of therapy:</Text>
    {userData.selectedOption && userData.selectedOption.map((preference, index) => (
        <Text key={index} className="text-sm">{preference}</Text> 
        ))}
      
  </View>
    
    <View>
      <Text className="text-base text-blue-500">Appointment Days:</Text>
      {Object.entries(userData.selectedDays).map(([day, selected]) => (
                selected && <Text key={day} className="text-sm">{day}</Text>
              ))}
      <Text>{`Time: ${userData.time}`}</Text>
      
    </View>
  </View>

  </View>
  </React.Fragment>
    )}
    
    <TouchableOpacity
    onPress={() => navigation.navigate("Auth", {screen: "SignUpT"})}
    className="justify-center items-center border-2 border-gray-500 bg-blue-500  rounded-md h-10 w-[100px] mx-5 mb-4 "
    >
        <Text>Edit Profile</Text>
    </TouchableOpacity>
  
  </View>
  
 </ScrollView>
  )
}

export default ProfileT