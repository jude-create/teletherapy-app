import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import Swiper from 'react-native-swiper';
import { useNavigation } from "@react-navigation/native";

const MatchTherapist = () => {
  const navigation = useNavigation();

    const [patientPreferences, setPatientPreferences] = useState(null);
    const [matchedTherapists, setMatchedTherapists] = useState([]);
  
  
    useEffect(() => {
      const fetchPatientPreferences = async () => {
        try {
          const currentUser = auth.currentUser;
  
          if (!currentUser) {
            console.warn('No authenticated user');
            return;
          }
  
          const userId = currentUser.uid;
          const patientPreferencesDocRef = doc(db, 'patients', userId);
          const patientPreferencesSnapshot = await getDoc(patientPreferencesDocRef);
  
          if (patientPreferencesSnapshot.exists()) {
            const patientPreferences = patientPreferencesSnapshot.data();
            setPatientPreferences(patientPreferences);
              console.log(patientPreferences)
            // Once patient preferences are fetched, find matched therapists
            findMatchedTherapists(patientPreferences);
          } else {
            console.warn('No patient preferences found for the authenticated user');
          }
        } catch (error) {
          console.error('Error fetching patient preferences:', error.message);
        }
      };
  
      const findMatchedTherapists = async (patientPreferences) => {
        try {
         
           
            
          const therapistsCollectionRef = collection(db, 'therapists');
      
          // Build the query based on defined properties in patientPreferences
          let q = query(therapistsCollectionRef)
           where('selectedOption', '==', patientPreferences.selectedOption),
          
 
        console.log(q)
          const querySnapshot = await getDocs(q);
      
          const therapists = [];
          querySnapshot.forEach((doc) => {
            const therapistData = doc.data();
            therapists.push(therapistData);
          });
          console.log(therapists)
          setMatchedTherapists(therapists);
        } catch (error) {
          console.error('Error fetching and matching therapists:', error.message);
        }
      };
      
  
      fetchPatientPreferences();
    }, []);

  
  return (
    <Swiper
    horizontal
      loop={false}
     
   
  >
    {matchedTherapists.length > 0 &&
      matchedTherapists.map((therapist, index) => (
        <View key={index} className="flex-1  space-y-5  rounded-2xl w-[400px]  shadow-lg shadow-black pt-6">
          <View className="justify-center items-center relative">
            <Image className="h-36 w-36 border rounded-full" source={require('../assets/Hip_Chrome.jpg')}  />
          </View>
     <ScrollView>
          <View className="space-y-2 items-center">
            <View className="space-y-3 items-center">
              <Text className="text-xl font-bold">{therapist.name}</Text>

              <Text className="text-base font-bold">{therapist.email}</Text>

              <View className="flex-row space-x-10">
                <Text className="text-base">{`Phone: ${therapist.phone}`}</Text>
                <Text className="text-base">{`Age: ${therapist.age}`}</Text>
              </View>

              <View>
                <Text className="text-base">{`License: ${therapist.license}`}</Text>
              </View>

              <View className="w-64">
                <Text className="text-base">{therapist.text}</Text>
              </View>

              <View className="flex-row space-x-8">
                <View className="space-y-2">
                  <Text className="text-base text-blue-500"> My Specialities:</Text>
                  {therapist.therapistExperiences &&
                    therapist.therapistExperiences.map((experience, index) => (
                      <Text key={index} className="text-sm">
                        {experience}
                      </Text>
                    ))}
                </View>

                <View>
                  <Text className="text-base text-blue-500">My Profile </Text>
                  {therapist.therapistProfile &&
                    therapist.therapistProfile.map((profile, index) => (
                      <Text key={index} className="text-sm">
                        {profile}
                      </Text>
                    ))}
                </View>
              </View>
               
  <View className="flex-row space-x-16  ">
  <View>
    <Text className="text-base text-blue-500">Type of therapy:</Text>
    {therapist.selectedOption && therapist.selectedOption.map((preference, index) => (
        <Text key={index} className="text-sm">{preference}</Text> 
        ))}
      
  </View>
    
  <View>
    <Text className="text-base text-blue-500">Appointment Days:</Text>
    {therapist.selectedDays && Object.entries(therapist.selectedDays).map(([day, selected]) => (
    selected && <Text key={day} className="text-sm">{day}</Text>
   ))}
    <Text>{`Time: ${therapist.time}`}</Text>
  </View>

  </View>
            </View>

            <TouchableOpacity
             onPress={() => navigation.navigate("Book")}
              className="justify-center items-center border-2 border-gray-500 bg-blue-500 rounded-md h-10 w-[200px] mx-5"
            >
              <Text className="text-lg text-white">Book an Appointment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
      ))}
  </Swiper>
);
};



export default MatchTherapist;
