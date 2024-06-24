import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native";
import { BanknotesIcon, BellIcon, ChatBubbleLeftIcon, SparklesIcon, UserIcon } from 'react-native-heroicons/solid';

const Admin = () => {
    const navigation = useNavigation();

    return (
      <View className="flex-1   bg-zinc-200  space-y-6 ">
       <View className="border-1 border-blue-500 bg-header h-[90px]  gap-8">
    <View className="flex-row pt-3">
         <SparklesIcon size={30} color="#f5f5dc" />
         <Text className="font-bold uppercase text-yellow-50 tracking-[2px] pt-2 text-base">
            VirtualMindSpace
         </Text>
    </View>
    </View>
    <Text className="text-lg text-center">Admin</Text>
       <View className="flex-row space-x-4 mt-4 p-2">
        <TouchableOpacity
        className="border-2 justify-center  border-blue-500 bg-blue-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
        >
        <View className="flex-row space-x-14 px-2">
          <Text className="text-base font-bold text-slate-100 uppercase">Therapists</Text>
          <UserIcon size={40} color="#808080" />
        </View>
          <Text className="px-2 text-slate-50 font-extrabold tracking-wide">12</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
        className="border-2 justify-center  border-orange-500 bg-orange-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
        >
       <View className="flex-row space-x-14 px-1">
          <Text className="text-base font-bold text-slate-100 uppercase">Patients</Text>
          <BellIcon size={40} color="#999999"/>
        </View>
          <Text className="px-2 text-slate-50 font-extrabold tracking-wide">10</Text>
        </TouchableOpacity>
      </View>
  
     <View className="flex-row space-x-3 mt-4 p-2">
        <TouchableOpacity
         className="border-2 justify-center  border-green-500 bg-green-600  rounded-md h-24 w-44 shadow-lg shadow-gray-900"
        >
        <View  className="flex-row space-x-12 px-2">
          <Text className="text-base font-bold text-slate-100 uppercase">Content</Text>
          <ChatBubbleLeftIcon size={40} color="#808080"/>
        </View>
        </TouchableOpacity>
  
        <TouchableOpacity
        className="border-2 justify-center  border-red-500 bg-red-600  rounded-md h-24 w-[184px] shadow-lg shadow-gray-900"
        >
        <View  className="flex-row space-x-14 ">
          <Text className="font-bold text-slate-100 uppercase"> Invoices</Text>
          <BanknotesIcon size={40} color="#999999" />
        </View>
          <Text className="px-2 text-slate-50 font-extrabold tracking-wide">7</Text>
        </TouchableOpacity>
      </View>
  
  
  
    <View>
      <Image
       className="w-full h-48"
       source={require('../assets/priscilla.jpg')} />
     </View>
  
    
  </View>
    )
}

export default Admin;