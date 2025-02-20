import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SparklesIcon } from "react-native-heroicons/solid"; 
import { Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from 'react-native';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';






//first component
const ComponentOne = ({ selectedOption, setSelectedOption, updateUserData }) => {

    

    const handleCheckboxToggle = (option) => {
        if (selectedOption.includes(option)) {
          setSelectedOption(selectedOption.filter((item) => item !== option));
          console.log(selectedOption);
        } else {
          setSelectedOption([...selectedOption, option]);
        }
        updateUserData();
      };
      
    
    return (
        <View className=" p-2 ">
        <Text className="font-bold text-lg text-center pb-10">What type of therapy do you offer</Text>
        <CheckBox
          title="Individual"
          checked={selectedOption.includes('Individual')}
          onPress={() => handleCheckboxToggle('Individual')}
        />
        <CheckBox
          title="Couples"
          checked={selectedOption.includes('Couples')}
          onPress={() => handleCheckboxToggle('Couples')}
        />
        <CheckBox
          title="Teen"
          checked={selectedOption.includes('Teen')}
          onPress={() => handleCheckboxToggle('Teen')}
        />
       
      
      </View>
  );
};


  //second component
 
  //third component
 
  //COMPONENT FOUR
  const ComponentTwo = ({ selectedBox, setSelectedBox, updateUserData }) => {
    const handleCheckboxToggle = (option) => {
      if (selectedBox.includes(option)) {
        setSelectedBox(selectedBox.filter((item) => item !== option));
        console.log(selectedBox);
      } else {
        setSelectedBox([...selectedBox, option]);
      }
      updateUserData();
    };
  
    return (
      <View className=" p-2">
        <Text className="font-bold text-lg text-center pb-10">Therapist Profile:</Text>
        <CheckBox
          title="Male therapist"
          checked={selectedBox.includes('Male therapist')}
          onPress={() => handleCheckboxToggle('Male therapist')}
        />
        <CheckBox
          title="Female therapist"
          checked={selectedBox.includes('Female therapist')}
          onPress={() => handleCheckboxToggle('Female therapist')}
        />
        <CheckBox
          title="Christian-based therapist"
          checked={selectedBox.includes('Christian-based therapist')}
          onPress={() => handleCheckboxToggle('Christian-based therapist')}
        />
        <CheckBox
          title="Non-religious therapist "
          checked={selectedBox.includes('Non-religious therapist')}
          onPress={() => handleCheckboxToggle('Non-religious therapist')}
        />
        <CheckBox
          title="Older therapist (45+)"
          checked={selectedBox.includes('Older therapist (45+)')}
          onPress={() => handleCheckboxToggle('Older therapist (45+)')}
        />
       
      </View>
    );
  };
  

   
  const ComponentThree = ({ selectedBox2, setSelectedBox2, updateUserData }) => {

    const navigation = useNavigation();
    const handleCheckboxToggle = (option) => {
      if (selectedBox2.includes(option)) {
        setSelectedBox2(selectedBox2.filter((item) => item !== option));
        console.log(selectedBox2);
      } else {
        setSelectedBox2([...selectedBox2, option]);
      }
      updateUserData();
    };
  
    return (
      <ScrollView className=" p-2">
        <Text className="font-bold text-lg text-center pb-2">Therapist Experiences...</Text>
        <CheckBox
          title="Depression"
          checked={selectedBox2.includes('Depression')}
          onPress={() => handleCheckboxToggle('Depression')}
        />
        <CheckBox
          title="Stress and Anxiety"
          checked={selectedBox2.includes('Stress and Anxiety')}
          onPress={() => handleCheckboxToggle('Stress and Anxiety')}
        />
        <CheckBox
          title="Coping with addictions"
          checked={selectedBox2.includes('Coping with addictions')}
          onPress={() => handleCheckboxToggle('Coping with addictions')}
        />
        <CheckBox
          title="Relationship issues "
          checked={selectedBox2.includes('Relationship issues')}
          onPress={() => handleCheckboxToggle('Relationship issues')}
        />
        <CheckBox
          title="Family conflicts"
          checked={selectedBox2.includes('Family conflicts')}
          onPress={() => handleCheckboxToggle('Family conflicts')}
        />
         <CheckBox
          title="Trauma and abuse"
          checked={selectedBox2.includes('Trauma and abuse')}
          onPress={() => handleCheckboxToggle('Trauma and abuse')}
        />
         <CheckBox
          title="Coping with grief and loss"
          checked={selectedBox2.includes('Coping with grief and loss')}
          onPress={() => handleCheckboxToggle('Coping with grief and loss')}
        />
         <CheckBox
          title="Anger management"
          checked={selectedBox2.includes('Anger management')}
          onPress={() => handleCheckboxToggle('Anger management')}
        />
         <CheckBox
          title="Bipolar disorder"
          checked={selectedBox2.includes('Bipolar disorder')}
          onPress={() => handleCheckboxToggle('Bipolar disorder')}
        />
         <CheckBox
          title="Concentration,memory and focus"
          checked={selectedBox2.includes('Concentration,memory and focus')}
          onPress={() => handleCheckboxToggle('Concentration,memory and focus')}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("TherapistDrawer")}
         className="justify-center items-center  bg-blue-500  rounded-full h-14  mt-2">
          <Text>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };


const Questions = () => {
    const [activeComponent, setActiveComponent] = useState(1);
    const [selectedOption, setSelectedOption] = useState([]);
    const [selectedBox, setSelectedBox] = useState([]);
    const [selectedBox2, setSelectedBox2] = useState([]);

    const updateUserData = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.warn('No authenticated user');
          return;
        }
        
        const userId = currentUser.uid;
        const userDocRef = doc(db, "therapists", userId);
        
        // Update the user document with the selected options
     
        
       

        const updateData = {};
    if (selectedOption) updateData.selectedOption = selectedOption;
    if (selectedBox.length > 0) updateData.therapistProfile = selectedBox;
    if (selectedBox2.length > 0) updateData.therapistExperiences = selectedBox2;
     
        // Update the user document with the selected options
        await updateDoc(userDocRef, updateData, {merge: true});
    
       // console.log('User data updated successfully');
        
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    };
    


    const components = {
      1: <ComponentOne
      selectedOption={selectedOption}
      setSelectedOption={setSelectedOption}
      updateUserData={updateUserData}
      />,
      2: <ComponentTwo 
      selectedBox={selectedBox}
      setSelectedBox={setSelectedBox}
      updateUserData={updateUserData}
      />,
      3: <ComponentThree 
      selectedBox2={selectedBox2}
      setSelectedBox2={setSelectedBox2}
      updateUserData={updateUserData}
      />,
      
     
      // Add ComponentThree through ComponentSeven...
    };
  
    const switchComponent = (componentNumber) => {
      setActiveComponent  (componentNumber);
    }
  
  return (
    <SafeAreaView  className="flex-1 relative  bg-zinc-200">
        <View className="border-1 border-blue-500 bg-header h-[130px] flex-row  gap-14">
    <View className="flex-row  pt-3 px-2">
         <SparklesIcon size={40} color="#f5f5dc" />
         <Text className="font-bold uppercase text-yellow-50 tracking-[5px] pt-3 text-lg">
            VirtualMindSpace
         </Text>
       </View>
    </View>

    <View className=" flex-1 justify-center ">
        {components[activeComponent]}
        <View className="flex-row space-x-12 items-end mt-2 p-2 px-20 ">
          {[1, 2, 3].map((componentNumber) => (
            <TouchableOpacity
              key={componentNumber}
              className={`border-4 border-gray-500 w-12 h-3 ${
                activeComponent === componentNumber ? 'bg-blue-600' : ''
              }`}
              onPress={() => switchComponent(componentNumber)}
            ></TouchableOpacity>
          ))}
        </View>
      </View>
     
    </SafeAreaView>
  );
  };



const styles = StyleSheet.create({
   
    selectedOption: {
       
      backgroundColor: 'green',
    },
    'active-component': {
      borderColor: 'blue' // Change this to the highlight color you want
    },
    
  });


export default Questions