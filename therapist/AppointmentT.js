import { View, Text, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'rn-tailwind'
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { KeyboardAvoidingView } from 'react-native';

const AppointmentT = () => {
   
    const [selectedDays, setSelectedDays] = useState({
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false
});
  const [time, setTime] = useState("");
  const [appointmentSetSuccess, setAppointmentSetSuccess] = useState(false);

  const toggleDaySelection = (day) => {
    setSelectedDays(prevState => ({
      ...prevState,
      [day]: !prevState[day]
    }));
  };

  const handleSetAppointment = async () => {
   
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('No authenticated user');
          return;
        }
        
        const userId = currentUser.uid;
        const userDocRef = doc(db, "therapists", userId);
        
        // Update the user document with the selected options
     
        
       

        const updateData = {
          selectedDays: selectedDays,
          time: time
        };
   
        // Update the user document with the selected options
        await updateDoc(userDocRef, updateData, {merge: true});
    
        console.log('User data updated successfully');
        setAppointmentSetSuccess(true); // Set success message visibility
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    };
    
    // Here you can handle setting the appointment with selectedDays and time
    console.log("Selected Days:", selectedDays);
    console.log("Time:", time);
    // You can perform further actions like sending the data to a server
  
  return (
    <ScrollView className="flex-1  space-y-5  rounded-2xl   m-auto ">
    <View>
      <Text className="text-lg font-bold text-center text-blue-400">Set Appointment</Text>
    </View>

    <View>
    <Text className="text-base font-bold">Select days available</Text>

    <View className="flex-row space-x-4 mt-4">
    <TouchableOpacity
            onPress={() => toggleDaySelection("Monday")}
            className={`border-2 justify-center ${selectedDays.Monday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Monday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleDaySelection("Tuesday")}
            className={`border-2 justify-center ${selectedDays.Tuesday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Tuesday</Text>
          </TouchableOpacity>

    </View>
     
     <View className="flex-row space-x-4 mt-4">
     <TouchableOpacity
            onPress={() => toggleDaySelection("Wednesday")}
            className={`border-2 justify-center ${selectedDays.Wednesday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Wednesday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleDaySelection("Thursday")}
            className={`border-2 justify-center ${selectedDays.Thursday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Thursday</Text>
          </TouchableOpacity>

    </View>

    <View className="flex-row space-x-4 mt-4">
    <TouchableOpacity
            onPress={() => toggleDaySelection("Friday")}
            className={`border-2 justify-center ${selectedDays.Friday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Friday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleDaySelection("Saturday")}
            className={`border-2 justify-center ${selectedDays.Saturday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Saturday</Text>
          </TouchableOpacity>

      
      </View>

      <View className="flex items-center mt-4">
      <TouchableOpacity
            onPress={() => toggleDaySelection("Sunday")}
            className={`border-2 justify-center ${selectedDays.Sunday ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'} rounded-md h-10 w-40 shadow-lg shadow-gray-900`}
          >
            <Text className="text-lg font-bold text-slate-100 uppercase text-center">Sunday</Text>
          </TouchableOpacity>

      </View>
    </View>

    <View className=" mt-8 flex items-center">
        <Text className="text-base font-bold">Set time available</Text>
    <TextInput
     className="border-2 h-16  border-gray-500 rounded-lg p-2 bg-white w-44 mt-2 "
          keyboardType="default"
          multiline={true}
          placeholder="use 24hrs format eg(8:00 - 16:00)"
          value={time}
          onChangeText={(text) => setTime(text)}
     />
    </View>
    <View className="flex items-center">
    <TouchableOpacity
     onPress={handleSetAppointment}
     className="justify-center items-center border-2 border-gray-500 bg-blue-500 rounded-md h-10 w-[200px] mx-5"
    >
        <Text className="text-lg text-white">Set Appointment Schedule </Text>
    </TouchableOpacity>
    </View>
     {/* Success message */}
     {appointmentSetSuccess && (
        <View className="mt-4">
          <Text className="text-lg font-bold text-green-500 text-center">Appointment set successfully!</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default AppointmentT