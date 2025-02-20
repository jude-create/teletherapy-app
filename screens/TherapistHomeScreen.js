import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import React from 'react';
import { BanknotesIcon, BellIcon, ChatBubbleLeftIcon, UserIcon } from 'react-native-heroicons/solid';
import { useNavigation } from "@react-navigation/native";

const TherapistHomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      
      {/* Stats Section */}
      <View className="flex-row justify-between">
        {/* Patients Card */}
        <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg p-4 shadow-md mx-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white">Patients</Text>
            <UserIcon size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-extrabold text-white mt-2">10</Text>
        </TouchableOpacity>

        {/* Appointments Card */}
        <TouchableOpacity className="flex-1 bg-orange-600 rounded-lg p-4 shadow-md mx-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white">Appointments</Text>
            <BellIcon size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-extrabold text-white mt-2">4</Text>
        </TouchableOpacity>
      </View>

      {/* Messages & Billing Section */}
      <View className="flex-row justify-between mt-4">
        {/* Messages Card */}
        <TouchableOpacity className="flex-1 bg-green-600 rounded-lg p-4 shadow-md mx-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white">Messages</Text>
            <ChatBubbleLeftIcon size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-extrabold text-white mt-2">20</Text>
        </TouchableOpacity>

        {/* Billing & Invoices Card */}
        <TouchableOpacity className="flex-1 bg-red-600 rounded-lg p-4 shadow-md mx-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-white">Billing</Text>
            <BanknotesIcon size={40} color="#fff" />
          </View>
          <Text className="text-3xl font-extrabold text-white mt-2">7</Text>
        </TouchableOpacity>
      </View>

      {/* Questionnaire Section */}
      <View className="mt-6 bg-white rounded-lg p-4 shadow-md">
        <Text className="text-sm font-medium text-gray-600">
          Fill out the questionnaire below to complete your profile. Ignore if already answered.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Questions")}
          className="mt-3 bg-blue-500 py-3 rounded-lg flex items-center"
        >
          <Text className="text-lg font-semibold text-white">Complete Questionnaire</Text>
        </TouchableOpacity>
      </View>

      {/* Image Section */}
      <View className="mt-6">
        <Image className="w-full h-48 rounded-lg shadow-md" source={require('../assets/priscilla.jpg')} />
      </View>

      {/* Training Section */}
      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-lg font-semibold">Begin your therapist training</Text>
        <TouchableOpacity>
          <Text className="text-lg font-semibold text-blue-600 ml-2">here</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

export default TherapistHomeScreen;
