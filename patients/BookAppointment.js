import { View, Text, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { CalendarIcon, ClockIcon, CheckCircleIcon } from 'react-native-heroicons/solid';

const BookAppointment = ({ therapistId, visible, onClose }) => {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const onChange = (event, selectedDate) => {
    if (selectedDate) setDate(selectedDate);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const saveAppointment = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('No authenticated user');
        return;
      }

      const userId = currentUser.uid;
      const appointmentData = {
        therapistId: therapistId,
        appointmentDateTime: date,
      };

      await setDoc(doc(db, 'appointments', userId), appointmentData, { merge: true });
      setAppointmentBooked(true);

      // Navigate after a delay for better UX
      setTimeout(() => {
        onClose(); // Close modal
        navigation.navigate('PatientDrawer');
      }, 1500);
    } catch (error) {
      console.error('Error saving appointment:', error.message);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white w-80 p-6 rounded-2xl shadow-lg items-center">
          {/* Header */}
          <Text className="text-xl font-bold text-gray-800">Book an Appointment</Text>

          {/* Date Selection */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center space-x-2 p-3 bg-gray-100 rounded-lg mt-4 w-full"
          >
            <CalendarIcon size={22} color="#2563EB" />
            <Text className="text-lg text-gray-700">Select Date</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={date} mode="date" is24Hour display="default" onChange={onChange} />
          )}

          {/* Time Selection */}
          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-row items-center space-x-2 p-3 bg-gray-100 rounded-lg mt-3 w-full"
          >
            <ClockIcon size={22} color="#2563EB" />
            <Text className="text-lg text-gray-700">Select Time</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker value={date} mode="time" is24Hour display="default" onChange={onChange} />
          )}

          {/* Selected Date & Time */}
          <View className="mt-4">
            <Text className="text-lg font-semibold text-gray-600">{date.toLocaleString()}</Text>
          </View>

          {/* Success Message */}
          {appointmentBooked && (
            <View className="flex-row items-center space-x-2 mt-3">
              <CheckCircleIcon size={24} color="green" />
              <Text className="text-lg text-green-600 font-bold">Appointment booked!</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-6 w-full space-y-2">
            <TouchableOpacity
              onPress={saveAppointment}
              className="bg-blue-500 py-3 rounded-lg w-full items-center"
            >
              <Text className="text-lg text-white font-semibold">Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} className="py-3 w-full items-center">
              <Text className="text-lg text-gray-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookAppointment;
