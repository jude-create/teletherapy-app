import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SparklesIcon } from "react-native-heroicons/solid"; 
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const PatientHomeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const patientsCollectionRef = collection(db, 'patients');
        const q = query(patientsCollectionRef, where('email', '==', currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };
    fetchUserData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <StatusBar style="light" />

      {/* Header at the absolute top */}
      <View className="bg-[#2563EB] py-4 px-2 flex-row justify-between items-center shadow-lg absolute top-0 left-0 right-0 z-10">
        <View className="flex-row items-center flex-1">
          <SparklesIcon size={32} color="#f5f5dc" />
          <Text className="font-bold uppercase text-yellow-50 text-lg">
            VirtualMindSpace
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate("Match")}
          className="px-2 py-2 bg-yellow-300 rounded-lg shadow-md"
        >
          <Text className="font-semibold uppercase text-blue-700 text-sm">
            Find a Therapist
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ensure content starts below the header */}
      <ScrollView className="flex-1  mt-9">
        {userData && (
          <View className="bg-blue-500 py-4 px-4 mt-2 rounded-lg mx-16 shadow-md">
            <Text className="font-semibold uppercase text-white text-lg text-center ">
              Welcome back, {userData.firstName}! 👋
            </Text>
          </View>
        )}

        {/* Featured Image */}
        <View className="mb-6 ">
          <Image
            className="w-full h-52 rounded-lg shadow-md"
            source={require('../assets/minh.jpg')}
          />
        </View>

        {/* Info Section */}
        <View className="space-y-4 px-4">
          <Text className="text-gray-700 text-lg leading-7 font-medium">
            Therapy can have a profound impact on your mental health and overall well-being. 
            It promotes emotional healing, reduces stress, and helps build resilience. Here are some 
            of the key benefits of therapy:
          </Text>

          <View className="bg-white p-4 rounded-lg shadow-md">
            <Text className="text-blue-600 text-lg font-semibold">Key Benefits of Therapy:</Text>
            <Text className="text-gray-600 text-base mt-2">
              ✅ Emotional Healing{'\n'}
              ✅ Improved Mental Health{'\n'}
              ✅ Increased Self-Awareness{'\n'}
              ✅ Better Relationships{'\n'}
              ✅ Stress Reduction & Trauma Recovery{'\n'}
            </Text>
          </View>

          {/* Questionnaire Section */}
          <Text className="text-gray-900 text-lg font-bold text-center">
            Begin your journey to peace of mind!
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Question")}
            className="bg-blue-600 py-3 rounded-xl items-center shadow-lg"
          >
            <Text className="text-white font-semibold text-lg">Fill Out the Questionnaire</Text>
          </TouchableOpacity>

          {/* Additional Learning */}
          <View className="flex-row items-center justify-center mt-2">
            <Text className="text-gray-700 text-base font-medium">
              Learn more about the effects of therapy 
            </Text>
            <TouchableOpacity>
              <Text className="text-blue-600 text-base font-semibold ml-1 underline">here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientHomeScreen;
