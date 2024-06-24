import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import { addDoc, doc, getFirestore, collection, setDoc } from 'firebase/firestore';
import { db, auth} from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';



const PatientSignScreen = () => {
  const navigation = useNavigation();


  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState(""); 
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState("")
  const [userType, setUserType] = useState("Patient");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState(null);

  

  const checkPasswordsMatch = () => {
    if (password === confirmPassword) {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(false);
    }
  };



  const signUp = async () => {
    try {
      // Check if passwords match before proceeding
      checkPasswordsMatch();
      const authUser = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }
     
      const userDocRef = doc(db, "patients", authUser.user.uid);

      // Create a new patient object
     if(authUser){
       const newPatient = {
        uid: authUser.user.uid,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        text: text,
        birthDate: birthDate,
        profileImage: "",
        selectedOption: '',
        gender: '',
       relationshipStatus: '',
        therapistPreferences: [],
        therapistExperience : [],
      };
      await setDoc(userDocRef, newPatient );
    
      // Create the user in Firebase Authentication
   
    }
      navigation.navigate('PatientDrawer');
    } catch (e) {
      // Handle errors
      setError('Error signing up. Please try again.');
      console.error(e);
    }
  };


  
  return (
    <SafeAreaView className="flex-1  pt-6 bg-zinc-200 space-y-4 ">
      <TouchableOpacity
     onPress={() => navigation.navigate("Home")}
     className="px-3">
    <ArrowSmallLeftIcon size={30}  color="#000000"/>
    </TouchableOpacity>
      <View className="p-3">
        <Text className="font-extrabold text-3xl tracking-[2px] text-slate-500">
        Sign Up
        </Text>
      </View>
     

      <ScrollView className="px-4 space-y-6 relative">

      <View>
        {/* Input field for user type */}
        <TextInput
          className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
          placeholder="User Type (e.g., Patient or Therapist)"
          keyboardType="default"
          value={userType}
          onChangeText={(type) => setUserType(type)}
        />
      </View>
      
        <View className="flex-row space-x-2">
          
          <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
            keyboardType="default"
            placeholder="Enter your First name here"
            autoFocus
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />

         <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
            keyboardType="default"
            placeholder="Enter your Last name here"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
        </View>
       
        <View>
          <TextInput
           className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
            keyboardType="default"
            placeholder="Enter your email address here"
            type="Email-address"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
        </View>

        <View>
          <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
            keyboardType="default"
            placeholder="Enter your address"
            value={text}
            onChangeText={(text) => setText(text)}
          />
        </View>

        <View className="flex-row space-x-2">
         
        <TextInput
              className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white w-56"
              placeholder='Enter your phone number'
              keyboardType="numeric"
              value={phoneNumber}
              onChangeText={(number) => setPhoneNumber(number)}
              
            />

        <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white w-28"
            keyboardType="default"
            placeholder="DD/MM/Year"
            value={birthDate}
            onChangeText={(text) => setBirthDate(text)}
          />
        </View>

        <View>
        <Text className="text-red-600 italic">{error}</Text>
          <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white"
            placeholder="Enter your password"
            keyboardType="default"
            type="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
        </View>

        <View>
          <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white"
            placeholder="Confirm your password"
            keyboardType="default"
            type="password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry={true}
            onEndEditing={checkPasswordsMatch}
            
          />
           {!passwordsMatch && (
        <Text className="text-red-600 italic">Passwords do not match</Text>
      )}
        </View>

       
        <TouchableOpacity  
          onPress={signUp}
       className="justify-center items-center border-2 border-gray-500 bg-slate-500  rounded-md h-12 mb-2 ">
        <Text className="text-base font-bold">
            Sign up
        </Text>
       </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


export default PatientSignScreen