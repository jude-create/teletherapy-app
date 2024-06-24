import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import {  BanknotesIcon, BellIcon, ChatBubbleLeftIcon, UserIcon } from 'react-native-heroicons/solid';
import { useNavigation } from "@react-navigation/native";

const TherapistHomeScreen = () => {

  const navigation = useNavigation();
  return (
    <View className="flex-1   bg-zinc-200  p-2 space-y-6 ">

     <View className="flex-row space-x-4 mt-4">
      <TouchableOpacity
      className="border-2 justify-center  border-blue-500 bg-blue-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
      >
      <View className="flex-row space-x-16 px-2">
        <Text className="text-base font-bold text-slate-100 uppercase">Patients</Text>
        <UserIcon size={40} color="#808080" />
      </View>
        <Text className="px-2 text-slate-50 font-extrabold tracking-wide">10</Text>
      </TouchableOpacity>

      <TouchableOpacity
      className="border-2 justify-center  border-orange-500 bg-orange-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
      >
     <View className="flex-row space-x-6 px-1">
        <Text className="text-base font-bold text-slate-100 uppercase">Appointments</Text>
        <BellIcon size={40} color="#999999"/>
      </View>
        <Text className="px-2 text-slate-50 font-extrabold tracking-wide">4</Text>
      </TouchableOpacity>
    </View>

   <View className="flex-row space-x-3 mt-4">
      <TouchableOpacity
       className="border-2 justify-center  border-green-500 bg-green-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
      >
      <View  className="flex-row space-x-12 px-2">
        <Text className="text-base font-bold text-slate-100 uppercase">Messages</Text>
        <ChatBubbleLeftIcon size={40} color="#808080"/>
      </View>
        <Text className="px-2 text-slate-50 font-extrabold tracking-wide">20</Text>
      </TouchableOpacity>

      <TouchableOpacity
      className="border-2 justify-center  border-red-500 bg-red-600  rounded-md h-24 w-[184px] shadow-lg shadow-gray-900"
      >
      <View  className="flex-row space-x-1 ">
        <Text className="font-bold text-slate-100 uppercase">Billings and Invoices</Text>
        <BanknotesIcon size={40} color="#999999" />
      </View>
        <Text className="px-2 text-slate-50 font-extrabold tracking-wide">7</Text>
      </TouchableOpacity>
    </View>

  <View className="mt-4 p-2 space-y-3 mb-2">
   <Text className="font-bold text-sm">Fill Questionaire below to complete profile, ignore if answered already.</Text>
  <TouchableOpacity
  onPress={() => navigation.navigate( "Questions")} 
  className="justify-center items-center border-2 border-gray-500 bg-blue-500  rounded-md h-12 w-[300px] mx-5 ">
    <Text>Questionaire</Text>
  </TouchableOpacity>
  </View>

  <View>
    <Image
     className="w-full h-48"
     source={require('../assets/priscilla.jpg')} />
   </View>

    <View className="flex-row space-x-1 ">
       <Text className="font-extrabold text-base">
         Begin your therapist training 
       </Text>{""}
     <TouchableOpacity>
        <Text className="font-extrabold text-base text-blue-600">here</Text>
     </TouchableOpacity>
   </View>
</View>
  )
}

export default TherapistHomeScreen