import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';

const AdminLogin = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
  return (
    <SafeAreaView className="flex-1 relative pt-10 bg-zinc-200 space-y-1">
    <TouchableOpacity
     onPress={() => navigation.navigate("Home")}
     className="px-3">
    <ArrowSmallLeftIcon size={40}  color="#000000"/>
    </TouchableOpacity>
    
        <View className="p-6">
            <Text className="font-extrabold text-3xl tracking-[2px] text-slate-500">
            Admin Sign-In
            </Text>
        </View>

        <View className="px-3 space-y-6">
        <TextInput
            className="border-2 h-14  border-gray-500 rounded-md p-2 "
            keyboardType="default"
            placeholder="Enter your email address here"
            type="email"
            autoFocus
            value={email}
            onChangeText={(text) => setEmail(text)}
            
          />
           <TextInput
            className="border-2 h-14  border-gray-500 rounded-md p-2"
            placeholder="Enter your password"
            keyboardType="default"
            type="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
        </View>
        <View className="space-y-2 p-2">
      <TouchableOpacity 
          onPress={() => navigation.navigate("admin")}
       className="justify-center items-center border-2 border-gray-500 bg-blue-500  rounded-md h-12 w-[360px] ">
        <Text>
            Sign In
        </Text>
       </TouchableOpacity>
       </View>
    </SafeAreaView>
  )
}

export default AdminLogin