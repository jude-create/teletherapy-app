import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 flex-1 justify-center items-center bg-gray-400">
    <View className="relative w-20 h-20 justify-center items-center">
      <ActivityIndicator size={300} color="#007AFF" className="absolute rotate-90" />
      <ActivityIndicator size={300} color="#FF5733" className="absolute rotate-45" />
    </View>
    <Text className="text-lg text-gray-600 mt-32 text-center">{message}</Text>
  </View>
  );
};

export default LoadingOverlay;
