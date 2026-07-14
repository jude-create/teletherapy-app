import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../types/navigation';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import LoadingOverlay from '../components/LoadingOverlay'; // Import the LoadingOverlay component
import { createTherapistAccount } from '../services/therapists';

const TherapistSignScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState("");
  const [userType, setUserType] = useState("Therapist");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state

  const checkPasswordsMatch = () => {
    const matches = password === confirmPassword;
    setPasswordsMatch(matches);
    return matches;
  };

  const signUp = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!checkPasswordsMatch()) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!email || !password || !name) {
        setError('Please fill in your name, email, and password.');
        setLoading(false);
        return;
      }

      const therapist = {
        name: name,
        email: email,
        license: license,
        phone: phone,
        bio: bio,
        age: age,
        profileImage: "",
        selectedOption: "",
        therapistProfile: [] as string[],
        therapistExperiences: [] as string[],
      };

      await createTherapistAccount({ email, password, therapist });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error signing up. Please try again.');
      
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
      <ScrollView className="px-6 space-y-4 pt-3">
        {/* User Type */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="User Type (e.g., Therapist)"
          value={userType}
          onChangeText={(type) => setUserType(type)}
        />

        {/* Full Name */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Full Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />

        {/* Email */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Email Address"
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        {/* Phone Number */}
        <TextInput
          className="border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />

        {/* License Number and Age */}
        <View className="flex-row space-x-4">
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="License Number"
            keyboardType="numeric"
            value={license}
            onChangeText={(text) => setLicense(text)}
          />
          <TextInput
            className="flex-1 border-2 h-14 border-gray-500 rounded-xl p-4 bg-white"
            placeholder="Age"
            keyboardType="numeric"
            value={age}
            onChangeText={(text) => setAge(text)}
          />
        </View>

        {/* Bio */}
        <TextInput
          className="border-2 h-44 border-gray-500 rounded-xl p-4 bg-white"
          placeholder="Tell us more about yourself (Educational background, Certificates, etc.)"
          multiline
          value={bio}
          onChangeText={(text) => setBio(text)}
        />

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
          className="justify-center items-center bg-blue-500 rounded-full h-14 mb-8 "
        >
          <Text className="text-white text-lg font-bold">
            Sign Up
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TherapistSignScreen;
