import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Swiper from 'react-native-swiper';
import { useNavigation } from "@react-navigation/native";
import LoadingOverlay from '../components/LoadingOverlay';

const MatchTherapist = () => {
  const navigation = useNavigation();
  const [patientPreferences, setPatientPreferences] = useState(null);
  const [matchedTherapists, setMatchedTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientPreferences = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.warn('No authenticated user');
          setLoading(false);
          return;
        }

        const userId = currentUser.uid;
        const patientPreferencesDocRef = doc(db, 'patients', userId);
        const patientPreferencesSnapshot = await getDoc(patientPreferencesDocRef);

        if (patientPreferencesSnapshot.exists()) {
          const patientPreferences = patientPreferencesSnapshot.data();
          setPatientPreferences(patientPreferences);
          findMatchedTherapists(patientPreferences);
        } else {
          console.warn('No patient preferences found for the authenticated user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching patient preferences:', error.message);
        setLoading(false);
      }
    };

    const findMatchedTherapists = async (patientPreferences) => {
      try {
        const therapistsCollectionRef = collection(db, 'therapists');
        const q = query(therapistsCollectionRef, where('selectedOption', 'array-contains', patientPreferences.selectedOption));
        const querySnapshot = await getDocs(q);

        const therapists = querySnapshot.docs.map(doc => doc.data());
        setMatchedTherapists(therapists);
      } catch (error) {
        console.error('Error fetching and matching therapists:', error.message);
      }
      setLoading(false);
    };

    fetchPatientPreferences();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      {/* 🔄 Spinning Loader Animation */}
      {loading ? <LoadingOverlay message="Finding Therapists..." />
  
 : matchedTherapists.length === 0 ? (


        <View className="items-center space-y-4">
          <Text className="text-2xl font-semibold text-gray-700">No Therapists Found</Text>
          <Text className="text-lg text-gray-500 text-center px-5">
            Sorry, we couldn't find any therapists matching your preferences.
          </Text>
        </View>
      ) : (
        <Swiper horizontal loop={false} showsPagination={false}>
          {matchedTherapists.map((therapist, index) => (
            <View
              key={index}
              className="flex-1 bg-white shadow-lg rounded-3xl w-[380px] mx-auto p-6 mt-5"
            >
              {/* Profile Image */}
              <View className="items-center">
                <Image
                  className="h-40 w-40 border-4 border-blue-500 rounded-full shadow-lg"
                  source={require('../assets/Hip_Chrome.jpg')}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mt-5 space-y-5">
                {/* Therapist Details */}
                <View className="items-center">
                  <Text className="text-2xl font-bold text-gray-900">{therapist.name}</Text>
                  <Text className="text-lg font-semibold text-gray-600">{therapist.email}</Text>
                </View>

                {/* Contact Info */}
                <View className="flex-row justify-center space-x-8">
                  <Text className="text-lg font-semibold">{`📞 ${therapist.phone}`}</Text>
                  <Text className="text-lg font-semibold">{`🎂 Age: ${therapist.age}`}</Text>
                </View>

                <View className="w-full bg-gray-100 p-3 rounded-lg shadow-md">
                  <Text className="text-base text-gray-800">{therapist.text}</Text>
                </View>

                {/* Specialties and Profile */}
                <View className="flex-row justify-between px-5">
                  <View className="space-y-2">
                    <Text className="text-lg font-semibold text-blue-600">🛠 Specialties</Text>
                    {therapist.therapistExperiences?.map((experience, idx) => (
                      <Text key={idx} className="text-sm text-gray-700">• {experience}</Text>
                    ))}
                  </View>

                  <View className="space-y-2">
                    <Text className="text-lg font-semibold text-blue-600">📌 Profile</Text>
                    {therapist.therapistProfile?.map((profile, idx) => (
                      <Text key={idx} className="text-sm text-gray-700">• {profile}</Text>
                    ))}
                  </View>
                </View>

                {/* Therapy Type & Appointment Days */}
                <View className="flex-row justify-between px-5">
                  <View className="space-y-2">
                    <Text className="text-lg font-semibold text-blue-600">🧠 Therapy Type</Text>
                    {therapist.selectedOption?.map((therapy, idx) => (
                      <Text key={idx} className="text-sm text-gray-700">• {therapy}</Text>
                    ))}
                  </View>

                  <View className="space-y-2">
                    <Text className="text-lg font-semibold text-blue-600">📅 Available Days</Text>
                    {Object.entries(therapist.selectedDays || {}).map(([day, selected]) =>
                      selected ? <Text key={day} className="text-sm text-gray-700">• {day}</Text> : null
                    )}
                    <Text className="text-sm text-gray-700">{`⏰ Time: ${therapist.time}`}</Text>
                  </View>
                </View>

                {/* Book Appointment Button */}
                <View className="items-center mt-5">
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Book")}
                    className="bg-blue-600 py-3 px-8 rounded-xl shadow-md"
                  >
                    <Text className="text-lg font-semibold text-white">Book an Appointment</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          ))}
        </Swiper>
      )}
    </View>
  );
};

export default MatchTherapist;
