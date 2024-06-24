import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {  ArrowSmallLeftIcon, ChatBubbleLeftRightIcon, UserIcon } from 'react-native-heroicons/solid';

const RegisterScreen = () => {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);
  return (
   <SafeAreaView  className="flex-1  pt-10 bg-zinc-200 space-y-4 ">
   <TouchableOpacity
     onPress={() => navigation.navigate("Home")}
     className="px-3">
    <ArrowSmallLeftIcon size={40}  color="#000000"/>
    </TouchableOpacity>

    <View className="p-3">
      <Text className="font-extrabold text-3xl tracking-[2px] text-slate-500">
        Let's get you started
      </Text>
    </View>
   <View className="justify-center p-4 space-y-12">
    <View className="flex-row space-x-8">
    <UserIcon size={60} color="#676662" />
          <TouchableOpacity
          onPress={() => navigation.navigate("Auth", {screen: "SignUpP"})}
          >
            <Text className=" pt-4 text-lg text-slate-600">
              Sign Up for Online Therapy Here
            </Text>
           
          </TouchableOpacity>
    </View>

    <View className="flex-row space-x-8">
      <ChatBubbleLeftRightIcon size={60} color="#676662" />
      <TouchableOpacity 
      onPress={() => navigation.navigate("Auth", {screen: "SignUpT"})}
      >
      
        <Text className=" pt-4 text-lg text-slate-600">
          Create a Therapist Account
        </Text>
      </TouchableOpacity>
    </View>
  </View>
   </SafeAreaView>
  )
}

export default RegisterScreen