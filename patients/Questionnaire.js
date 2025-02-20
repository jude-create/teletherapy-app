import { View, Text,  TouchableOpacity,  StyleSheet, ScrollView} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { SparklesIcon } from "react-native-heroicons/solid"; 
import { Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from "@react-navigation/native";
import { addDoc, doc, getFirestore, collection, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth} from '../config/firebase';



//first component
const ComponentOne = ({ selectedOption, setSelectedOption, updateUserData }) => {
 
    const options = [
        { id: 1, text: 'Individual' },
        { id: 2, text: 'Couples' },
        { id: 3, text: 'Teen' },
      ];
    
      
    
      const handleOptionPress = (optionId) => {
        setSelectedOption(optionId);
        updateUserData(); 
      };
    
    return (
        <View className="space-y-5 p-2 flex-col items-center justify-center">
      <Text className="font-bold text-lg ">What type of therapy are you looking for?</Text>
      {options.map((option) => (
        <TouchableOpacity
        className="justify-center items-center border border-blue-500 bg-blue-500  rounded-full h-14 w-[360px]"
          key={option.id}
          style={[
            selectedOption === option.text ? styles.selectedOption : null,
            console.log(selectedOption)
          ]}
          onPress={() => handleOptionPress(option.text)}
        >
          <Text className="text-zinc-100 font-semibold text-base">{option.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};


  //second component
  const ComponentTwo = ({ selected, setSelected, updateUserData }) => {
    const options = [
        { id: 1, text: 'Female' },
        { id: 2, text: 'Male' },
       
      ];

      const handleOptionPress = (optionId) => {
        setSelected(optionId);
        updateUserData(); 
      };
    return (
        <View className="space-y-5 p-2 flex-col items-center justify-center">
        <Text className="font-bold text-lg ">What is your gender identity?</Text>
        {options.map((option) => (
          <TouchableOpacity
          className="justify-center items-center border border-blue-500 bg-blue-500 rounded-full  h-14 w-[360px]"
            key={option.id}
            style={[
              selected === option.text ? styles.selectedOption : null,
              console.log(selected)
            ]}
            onPress={() => handleOptionPress(option.text)}
          >
            <Text className="text-zinc-100 font-semibold text-base">{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  //third component
  const ComponentThree = ({ selectedOption2, setSelectedOption2, updateUserData }) => {
    const options = [
        { id: 1, text: 'Single' },
        { id: 2, text: 'In a relationship' },
        { id: 3, text: 'Married' },
        { id: 4, text: 'Divorced' },
        { id: 5, text: 'Widowed' },
       
      ];

      const handleOptionPress = (optionId) => {
        setSelectedOption2(optionId);
        updateUserData(); 
      };
    return (
        <View className="space-y-5 p-2 flex-col items-center justify-center">
        <Text className="font-bold text-lg ">What is your relationship status?</Text>
        {options.map((option) => (
          <TouchableOpacity
          className="justify-center items-center border border-blue-500 bg-blue-500 rounded-full  h-14 w-[360px]"
            key={option.id}
            style={[
              selectedOption2 === option.text ? styles.selectedOption : null,
              console.log(selectedOption2)
            ]}
            onPress={() => handleOptionPress(option.text)}
          >
            <Text className="text-zinc-100 font-semibold text-base">{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  //COMPONENT FOUR
  const ComponentFour = ({ selectedBox, setSelectedBox, updateUserData }) => {
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
      <View className=" p-2 ">
        <Text className="font-bold text-lg text-center pb-2">Therapist preferences:</Text>
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
  

   
  const ComponentFive = ({ selectedBox2, setSelectedBox2, updateUserData }) => {

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
      <ScrollView className=" px-2">
        <Text className="font-bold text-lg text-center pb-2">I prefer a therapist with experience in...</Text>
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
          checked={selectedBox2.includes('Family conflicts')}
          onPress={() => handleCheckboxToggle('Family conflicts')}
        />
        <TouchableOpacity
          onPress={()=> navigation.navigate('PatientDrawer')}
         className="justify-center items-center mb-10 mt-4 h-14 bg-blue-600  rounded-full  w-[360px] mx-auto ">
          <Text>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

 

  
  
  const Questionnaire = () => {
    const [activeComponent, setActiveComponent] = useState(1);
    const [selectedOption, setSelectedOption] = useState();
    const [selected, setSelected] = useState();
    const [selectedOption2, setSelectedOption2] = useState();
    const [selectedBox, setSelectedBox] = useState([]);
    const [selectedBox2, setSelectedBox2] = useState([]);
  
    const [message, setMessage] = useState(""); // Success or error message
    const [messageType, setMessageType] = useState(""); // "success" or "error"
  
    const updateUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setMessage("No authenticated user");
          setMessageType("error");
          return;
        }
  
        const userId = currentUser.uid;
        const userDocRef = doc(db, "patients", userId);
  
        const updateData = {};
        if (selectedOption) updateData.selectedOption = selectedOption;
        if (selected) updateData.gender = selected;
        if (selectedOption2) updateData.relationshipStatus = selectedOption2;
        if (selectedBox.length > 0) updateData.therapistPreferences = selectedBox;
        if (selectedBox2.length > 0) updateData.therapistExperience = selectedBox2;
  
        await updateDoc(userDocRef, updateData, { merge: true });
  
        setMessage("User data updated successfully!");
        setMessageType("success");
      } catch (error) {
        setMessage(`Error updating user data: ${error.message}`);
        setMessageType("error");
      }
    };
  
    const components = {
      1: <ComponentOne selectedOption={selectedOption} setSelectedOption={setSelectedOption} updateUserData={updateUserData} />,
      2: <ComponentTwo selected={selected} setSelected={setSelected} updateUserData={updateUserData} />,
      3: <ComponentThree selectedOption2={selectedOption2} setSelectedOption2={setSelectedOption2} updateUserData={updateUserData} />,
      4: <ComponentFour selectedBox={selectedBox} setSelectedBox={setSelectedBox} updateUserData={updateUserData} />,
      5: <ComponentFive selectedBox2={selectedBox2} setSelectedBox2={setSelectedBox2} updateUserData={updateUserData} />,
    };
  
    return (
      <SafeAreaView className="flex-1 bg-zinc-200">
        {/* Header */}
        <View className="border-1 border-blue-500 bg-blue-600 h-[130px] flex-row  gap-14">
        <View className="flex-row  pt-3 px-2 items-center">
          <SparklesIcon size={40} color="#f5f5dc" />
          <Text className="font-bold uppercase text-yellow-50 text-lg">VirtualMindSpace</Text>
        </View>
        </View>
  
        {/* Success or Error Message */}
        {message && (
          <View className={`p-4 mx-4 my-2 rounded-lg ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}>
            <Text className="text-white font-semibold">{message}</Text>
          </View>
        )}
  
        {/* Component Switching */}
        <View className=" flex-1  justify-center">
          {components[activeComponent]}
          <View className="flex-row gap-6 items-end mt-2 p-2 px-8">
            {[1, 2, 3, 4, 5].map((componentNumber) => (
              <TouchableOpacity
                key={componentNumber}
                className={`border-4 border-gray-500 w-12 h-3 ${activeComponent === componentNumber ? 'bg-blue-600' : ''}`}
                onPress={() => setActiveComponent(componentNumber)}
              />
            ))}
          </View>
        </View>
  
       
      </SafeAreaView>
    );
  };

 

const styles = StyleSheet.create({
  selectedOption: {
    borderColor: 'white',
    backgroundColor: 'darkblue',
  },
});

  
  export default Questionnaire;
  