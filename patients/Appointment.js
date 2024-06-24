import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Appointment() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setShowTimePicker(false);
    setDate(currentDate);
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
    setShowTimePicker(false);
  };

  const showTimePickerHandler = () => {
    setShowTimePicker(true);
    setShowDatePicker(false);
  };

  return (
    <View className="flex-1  space-y-5  rounded-2xl w-[400px] justify-center items-center ">
      <Text className="text-lg font-bold text-blue-500">Book an Appointment</Text>
      <TouchableOpacity onPress={showDatePickerHandler}>
        <Text className="text-lg font-bold">Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode='date'
          is24Hour={true}
          display='default'
          onChange={onChange}
        />
      )}
      <TouchableOpacity onPress={showTimePickerHandler}>
        <Text className="text-lg font-bold">Select Time</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode='time'
          is24Hour={true}
          display='default'
          onChange={onChange}
        />
      )}
      <View>
        <Text className="text-lg font-bold">{date.toLocaleString()}</Text>
      </View>
    </View>
  );
}
