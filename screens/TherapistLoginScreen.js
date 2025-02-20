import { View, Text } from 'react-native'
import React, { useEffect, useState }from 'react'
import { useNavigation } from "@react-navigation/native";
import {  ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import {  SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import LoadingOverlay from '../components/LoadingOverlay'; // Import the LoadingOverlay component

const TherapistLoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
      const [errorMessage, setErrorMessage] = useState("");
       const [loading, setLoading] = useState(false); // Add loading state
 
     React.useLayoutEffect(() => {
         navigation.setOptions({
           headerShown: false,
         });
       }, []);

       const handleSignIn = async () => {
        if (!email || !password) {
          setErrorMessage("Please input details");
          return;
        }
        setLoading(true); // Start loading
        setErrorMessage(""); // Clear any previous error messages
        try {
          // Sign in with email and password
          await signInWithEmailAndPassword(auth, email, password);
    
          // Navigate to the desired screen after successful sign-in
          // Replace "PatientDrawer" with the screen you want to navigate to
          navigation.navigate('TherapistDrawer');
        } catch (error) {
          
          setErrorMessage("Invalid email or password");
          // Handle authentication errors (e.g., display an error message to the user)
        }finally {
          setLoading(false); // Stop loading
        }
      };
     
     // Show LoadingOverlay if loading is true
  if (loading) {
    return <LoadingOverlay message="Logging in..." />;
  }
 
  return (
    <SafeAreaView className="flex-1  bg-zinc-200 ">
    <StatusBar style='dark' />
    <TouchableOpacity
     onPress={() => navigation.navigate("Home")}
     className="px-3 pt-4">
    <ArrowSmallLeftIcon size={40}  color="#000000"/>
    </TouchableOpacity>
    
        <View className="p-6">
            <Text className="font-extrabold text-2xl tracking-[2px] text-slate-500">
            Sign In
            </Text>
        </View>

        <View className="px-6 space-y-7">
        <TextInput
            className="border-2 h-14  border-gray-500 rounded-xl p-4 "
            keyboardType="default"
            placeholder="Enter your email address here"
            type="email"
            autoFocus
            value={email}
            onChangeText={(text) => setEmail(text)}
            
          />
           <TextInput
            className="border-2 h-14  border-gray-500 rounded-xl p-4"
            placeholder="Enter your password"
            keyboardType="default"
            type="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
        </View>

         {/* Error Message */}
              {errorMessage ? (
                <Text className="text-red-500 text-sm px-6 mt-2">{errorMessage}</Text>
              ) : null}

        <View className="flex-row gap-1 px-6 pt-2">
            <Text>
                Don't have an account? 
            </Text>
          <TouchableOpacity
           onPress={() => navigation.navigate("Auth", {screen: "Register"})}
          >
            <Text className=" text-blue-700 underline text-sm">
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
     
     
    <View className="flex-1 justify-end pb-12 px-6">
      <TouchableOpacity 
      onPress={handleSignIn}
       className="justify-center items-center  bg-blue-500  rounded-full h-14 w-full ">
        <Text className="text-white text-lg font-bold">
            Sign In
        </Text>
       </TouchableOpacity>
    </View>
       
    </SafeAreaView>
  )
}

  

export default TherapistLoginScreen