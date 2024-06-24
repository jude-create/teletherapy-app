import { View, Text, TextInput, TouchableOpacity, ScrollView  } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { ArrowSmallLeftIcon } from 'react-native-heroicons/solid';
import { addDoc, doc, getFirestore, collection, setDoc } from 'firebase/firestore';
import { db, auth} from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
//import { auth } from '../config/firebase';

const TherapistSignScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [license, setLicense] = useState("");
  const [text, setText] = useState("");
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState("")
  const [userType, setUserType] = useState("Therapist");
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
        setError("Passwords do not match");
        return;
      }
     
      const userDocRef = doc(db, "therapists", authUser.user.uid);
      // Create a new patient object
      if(authUser){
      const newTherapist = {
        uid: authUser.user.uid,
        name: name,
        email: email,
        license: license,
        phone: phone,
        text: text,
        age: age,
        profileImage: "",
        selectedOption: "",
      therapistProfile: [],
    therapistExperiences: [],
      }
      await setDoc(userDocRef, newTherapist);
      } 

      

      // Navigate to the desired screen after successful sign-up
      navigation.navigate("TherapistDrawer");
    } catch (e) {
      // Handle errors
      setError("Error signing up. Please try again.");
      console.error(e);
    }
  };
  
  return (
    <SafeAreaView className="flex-1  pt-5 bg-zinc-200 space-y-3 ">
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
   

    <ScrollView className="px-4 space-y-3 relative">

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
    
      <View>
        
        <TextInput
          className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white "
          keyboardType="default"
          placeholder="Enter your full name here"
          autoFocus
          value={name}
          onChangeText={(text) => setName(text)}
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
            placeholder='Phone Number'
            keyboardType="numeric"
            value={phone}
            onChangeText={(text) => setPhone(text)}
            
          />
      </View>


      <View className="flex-row space-x-2">
       
      <TextInput
            className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white w-60"
            placeholder='License Number'
            keyboardType="numeric"
            value={license}
            onChangeText={(number) => setLicense(number)}
            
          />

      <TextInput
          className="border-2 h-14  border-gray-500 rounded-lg p-2 bg-white w-24"
          keyboardType="default"
          placeholder="Age"
          value={age}
          onChangeText={(text) => setAge(text)}
        />
      </View>

      
      <View>
        <TextInput
          className="border-2 h-44  border-gray-500 rounded-lg pb-28 px-2 bg-white "
          keyboardType="default"
          multiline={true}
          placeholder="Tell us more about yourself(Educational background, Certificates etc)"
          value={text}
          onChangeText={(text) => setText(text)}
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

export default TherapistSignScreen