import { View, Text, Button, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SparklesIcon } from "react-native-heroicons/solid"; 
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';





const PatientHomeScreen = () => {

  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
    });
  }, []);

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
   <View className="flex-1 relative  bg-zinc-200  ">

    <View className="border-1 border-blue-500 bg-header h-[90px] flex-row  gap-8">
    <View className="flex-row pt-3">
         <SparklesIcon size={30} color="#f5f5dc" />
         <Text className="font-bold uppercase text-yellow-50 tracking-[2px] pt-2 text-base">
            VirtualMindSpace
         </Text>
    </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Match")} 
       >
        <Text className="font-semibold uppercase  text-base text-yellow-50  text-center pt-5">
         Match to a therapist
        </Text>
      </TouchableOpacity>
  </View>
 {userData && (
      <React.Fragment>
  <Text className="font-semibold uppercase  text-lg tracking-[2px] text-white px-3  border border-header bg-header">{`Hi ${userData.firstName}`}</Text>
  </React.Fragment>
    )}
   <ScrollView className="space-y-3 pt-1">
    <View>
    <Image
     className="w-full h-48"
     source={require('../assets/minh.jpg')} />
    </View>
    
    <View className="font-bold tracking-[6px] px-3  space-y-3">
      <Text className="font-bold text-base tracking-wider text-gray-600 ">Therapy, whether it's in the form of psychotherapy, counseling, or other mental health interventions,
       can have a profound and positive impact on a patient's well-being and overall quality of life. Here are some 
       of the positive effects of therapy on a patient: Emotional Healing, Improved Mental Health, Enhanced Self-Awareness, Stress Reduction 
       Improved Relationships, Enhanced Problem-Solving Skills, Increased Self-Esteem and Confidence, Addiction Recovery, Trauma Recovery, 
       Goal Achievement, Better Physical Health, Lifestyle Changes, Life Satisfaction, Resilience</Text>
      
       <Text className="font-bold text-lg tracking-wide text-gray-600">Begin your journey to peace of mind by filling this questionnaire</Text>
       <TouchableOpacity
         onPress={() => navigation.navigate("Question")} 
        className="justify-center items-center border-2 border-gray-500 bg-blue-500  rounded-md h-12 w-[360px] " >
        <Text className="text-white">Questionnaire</Text>
      </TouchableOpacity>
      <View className="flex-row space-x-1">
        <Text className="font-extrabold text-base">Learn more about the positive effects of Therapy</Text>{""}
        <TouchableOpacity>
        <Text className="font-extrabold text-base text-blue-600">here</Text>
        </TouchableOpacity>
     
      </View>
      
    </View>
     
     
     
     <StatusBar style='light' />
     </ScrollView> 
   </View>
   
  )
}

export default PatientHomeScreen