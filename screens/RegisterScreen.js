import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowSmallLeftIcon, ChatBubbleLeftRightIcon, UserIcon } from 'react-native-heroicons/solid';

const RegisterScreen = () => {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-zinc-200">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        className="px-4 pt-4"
      >
        <ArrowSmallLeftIcon size={40} color="#000000" />
      </TouchableOpacity>

      {/* Header */}
      <View className="px-6 pt-16">
        <Text className="font-extrabold text-3xl tracking-[2px] text-slate-600">
          Let's get you started
        </Text>
      </View>

      {/* Options Container */}
      <View className="flex-1  px-6 space-y-9 pt-14">
        {/* Option 1: Sign Up for Online Therapy */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth", { screen: "SignUpP" })}
          className="flex-row items-center bg-white rounded-lg p-6 shadow-md"
        >
          <UserIcon size={50} color="#676662" />
          <View className="ml-6 flex-1">
            <Text className="text-xl font-semibold text-slate-700">
              Sign Up for Online Therapy
            </Text>
            <Text className="text-sm text-slate-500 mt-1">
              Join as a patient and get started with therapy.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Create a Therapist Account */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Auth", { screen: "SignUpT" })}
          className="flex-row items-center bg-white rounded-lg p-6 shadow-md"
        >
          <ChatBubbleLeftRightIcon size={50} color="#676662" />
          <View className="ml-6 flex-1">
            <Text className="text-xl font-semibold text-slate-700">
              Create a Therapist Account
            </Text>
            <Text className="text-sm text-slate-500 mt-1">
              Join as a therapist and help others.
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;