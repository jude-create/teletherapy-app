import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from "@react-navigation/native";
import { SparklesIcon } from "react-native-heroicons/solid"; 
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    return (
        <View className="flex-1 bg-blue-500 justify-end items-center px-6 pb-10">
            <StatusBar style="light" />

            {/* Header Section */}
            <View className="items-center absolute top-64">
                <View className="flex-row items-center  space-x-3">
                    <SparklesIcon size={50} color="#f5f5dc" />
                    <Text className="text-3xl font-bold text-yellow-50 tracking-widest">
                        VirtualMindSpace
                    </Text>
                </View>
                <Text className="text-lg text-yellow-50 mt-4 text-center">
                    Welcome to the Home of Online Therapy
                </Text>
            </View>

            {/* Buttons Section */}
            <View className="w-full space-y-5">
                <TouchableOpacity
                    onPress={() => navigation.navigate("Auth", { screen: "Login" })}
                    className="py-3 rounded-full bg-yellow-50 border border-blue-700"
                >
                    <Text className="text-center text-blue-600 text-lg font-semibold">
                        Log In
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate("Auth", { screen: "Register" })}
                    className="py-3 rounded-full bg-transparent border border-yellow-50"
                >
                    <Text className="text-center text-yellow-50 text-lg font-semibold">
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default HomeScreen;