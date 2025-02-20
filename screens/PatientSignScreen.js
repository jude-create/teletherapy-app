import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import LoadingOverlay from '../components/LoadingOverlay'; // Import the LoadingOverlay component

const PatientSignScreen = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState("");
  const [userType, setUserType] = useState("Patient");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false); // Add loading state

  const checkPasswordsMatch = () => {
    if (password === confirmPassword) {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(false);
    }
  };

  const signUp = async () => {
    try {
      checkPasswordsMatch();
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }

      const authUser = await createUserWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, "patients", authUser.user.uid);

      const newPatient = {
        uid: authUser.user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
        birthDate: birthDate,
        profileImage: "",
        selectedOption: '',
        gender: '',
        relationshipStatus: '',
        therapistPreferences: [],
        therapistExperience: [],
      };

      await setDoc(userDocRef, newPatient);
      navigation.navigate('PatientDrawer');
    } catch (e) {
      setError('Error signing up. Please try again.');
      console.error(e);
    }finally {
      setLoading(false); // Stop loading
    }
  };

   // Show LoadingOverlay if loading is true
   if (loading) {
    return <LoadingOverlay message="Signing up..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-200">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        className="px-4 pt-4"
      >
        <ArrowSmallLeftIcon size={30} color="#000000" />
      </TouchableOpacity>

      {/* Header */}
      <View className="px-6 pt-4">
        <Text className="font-extrabold text-2xl tracking-[2px] text-slate-600">
          Sign Up
        </Text>
      </View>

      {/* Form Container */}
      <ScrollView className="px-6 space-y-6 pt-8">
        {/* User Type */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="User Type (e.g., Patient or Therapist)"
          value={userType}
          onChangeText={(type) => setUserType(type)}
        />

        {/* First Name and Last Name */}
        <View className="flex-row space-x-4">
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
        </View>

        {/* Email */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        {/* Address */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />

        {/* Phone Number and Birth Date */}
        <View className="flex-row space-x-4">
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(number) => setPhoneNumber(number)}
          />
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="DD/MM/YYYY"
            value={birthDate}
            onChangeText={(text) => setBirthDate(text)}
          />
        </View>

        {/* Password */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />

        {/* Confirm Password */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          onEndEditing={checkPasswordsMatch}
        />
        {!passwordsMatch && (
          <Text className="text-red-600 italic">Passwords do not match</Text>
        )}

        {/* Error Message */}
        {error && (
          <Text className="text-red-600 italic">{error}</Text>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={signUp}
          className="justify-center items-center bg-blue-500 rounded-full h-14 mb-2"
        >
          <Text className="text-white text-lg font-bold">
            Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientSignScreen;