import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from "@react-navigation/native";
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { auth } from '../config/firebase';
import LoadingOverlay from '../components/LoadingOverlay'; // Import the LoadingOverlay component

const LogInScreen = () => {
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
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('PatientDrawer'); // Navigate to PatientDrawer on success
    } catch (error) {
      setErrorMessage("Invalid email or password");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Show LoadingOverlay if loading is true
  if (loading) {
    return <LoadingOverlay message="Logging in..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-200">
      <StatusBar style="dark" />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        className="px-3 pt-4"
      >
        <ArrowSmallLeftIcon size={40} color="#000000" />
      </TouchableOpacity>

      {/* Header */}
      <View className="p-6">
        <Text className="font-extrabold text-2xl tracking-[2px] text-slate-500">
          Sign In
        </Text>
      </View>

      {/* Input Fields */}
      <View className="px-6 space-y-7">
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4"
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoFocus
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrorMessage(""); // Clear error message when typing
          }}
        />
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrorMessage(""); // Clear error message when typing
          }}
        />
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <Text className="text-red-500 text-sm px-6 mt-2">{errorMessage}</Text>
      ) : null}

      {/* Create Account Link */}
      <View className="flex-row gap-1 px-6 pt-2">
        <Text>Don't have an account?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth", { screen: "Register" })}
        >
          <Text className="text-blue-700 underline text-sm">
            Create an account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Section */}
      <View className="flex-1 justify-end pb-5 px-6">
        <TouchableOpacity
          onPress={handleSignIn}
          className="justify-center items-center bg-blue-500 rounded-full h-14"
        >
          <Text className="text-white text-lg font-semibold">Sign In</Text>
        </TouchableOpacity>

        <View className="items-center mt-4">
          <Text className="text-gray-600">If Therapist?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Auth", { screen: "T-Login" })}
          >
            <Text className="underline text-base text-blue-700 font-bold">
              Sign in as Therapist here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LogInScreen;