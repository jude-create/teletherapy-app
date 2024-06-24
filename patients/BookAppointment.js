import { View, Text, Modal, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const BookAppointment = ({ therapistId }) => {
    const navigation = useNavigation();
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [appointmentBooked, setAppointmentBooked] = useState(false); // State variable to track appointment status

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

        setAppointmentBooked(true); // Set appointment booked status

        // Navigate to the desired screen after saving the appointment
        navigation.navigate('PatientDrawer');
      } catch (error) {
        console.error('Error saving appointment:', error.message);
      }
    };
  
  return (
    <Modal className="h-36">
      <View className="flex-1 relative bg-zinc-200 space-y-5 rounded-2xl w-[400px] justify-center items-center">
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
        {appointmentBooked && ( // Show confirmation message if appointment is booked
          <Text className="text-lg text-green-500 font-bold">Appointment booked!</Text>
        )}
        <TouchableOpacity
          onPress={saveAppointment}
          className="justify-center items-center border-2 border-gray-500 bg-blue-500 rounded-md h-10 w-[200px] mx-5"
        >
          <Text className="text-lg text-white">Book an Appointment</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default BookAppointment;
