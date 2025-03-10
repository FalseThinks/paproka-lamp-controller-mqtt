import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useMQTT } from '../../context/MQTTContext';
import ColorWheel from '@/components/LEDCircle';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import LEDCircle from '@/components/LEDCircle';

export default function MainScreen() {
  const { isConnected, connectionInfo, publishData, disconnect } = useMQTT();
  const [colors, setColors] = useState<any[]>(Array(24).fill({ c:"#FFFFFF", b: -1 }));
  const [fills, setFills] = useState<any[]>([]);
  const [globalBrightnessPercentage, setGlobalBrightnessPercentage] = useState<number>(0);
  const [realGlobalBrightness, setRealGlobalBrightness] = useState<number>(0);

  const [hasFill, setHasFill] = useState<boolean>(false);
  const [fill, setFill] = useState<any[]>([]);
  const [isFlush, setIsFlush] = useState<boolean>(false);
  const [isIntermitent, setIsIntermitent] = useState<boolean>(false);

  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [requireGlobalBrightness, setRequireGlobalBrightness] = useState<boolean>(true);
  const [defaultFunctionSelected, setDefaultFunctionSelected] = useState<boolean>(false);
  const [fillToEmptySelected, setFillToEmptySelected] = useState<boolean>(false);

  const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted
  const router = useRouter(); // Initialize the router

  useEffect(() => {
        console.log("Main screen");
      }, [])

  useEffect(() => {
      setIsMounted(true); // Once the component is mounted, set isMounted to true
    }, []); // Empty dependency array ensures it runs only once when the component mounts
  
    
    useEffect(() => {
      if (!isMounted) return; // Avoid trying to navigate if the component is not yet mounted
      if (!isConnected) {
        console.log("User not connected! Navigating to connect screen.");
        router.push("/connect"); // Navigate to the /connect screen
      }
    }, [isConnected, isMounted, router]);

  const handleColorChange = (updatedColors:any) => {
    setColors(updatedColors);
  };

  const handleFunction = (functionName:string) => {
    if (selectedFunction===functionName){
      setDefaultFunctionSelected(false);
      setSelectedFunction("");
      setFillToEmptySelected(false);
    }else{
      setDefaultFunctionSelected(true);
      setSelectedFunction(functionName);
    
      if (functionName==="fill_to_empty")
        setFillToEmptySelected(true);
      else
        setFillToEmptySelected(false);
    
      // Apply function presets to colors
      let updatedColors:any[] = [];
      
      if (functionName === 'default') {
        // Simple white light at medium brightness
        updatedColors = Array(24).fill({ c:"#FFFFFF", b: 255 });
      } else
      {/*...*/}
      
      setColors(updatedColors);
    } 
  };

  const handleSendData = () => {
    // Prepare the data to be sent
    const colorsData = colors.map((color, index) => {
      const { c,  b } = color;
      return {
        position: index,
        c: c,
        b: b
      };
    });

    const fillsData = fills.map((fill, index) => {
      const { c, start, count, brightness} = fill;
      return {
        position:index,
        c: c,
        start: start,
        count: count,
        brightness: brightness
      }
    });

    const data = {
      leds: colorsData,
      has_fill: hasFill,
      fills: fillsData,
      is_flush: isFlush,
      is_intermitent: isIntermitent,
      global_b: realGlobalBrightness,
      mode: selectedFunction,
    };
    
    // Publish the data
    const success = publishData(data);
    
    if (success) {
      Alert.alert('Success', 'Data sent successfully!');
    } else {
      Alert.alert('Error', 'Failed to send data. Please check your MQTT connection.');
    }
  };

  const handleFlush = () => {
    setIsFlush(!isFlush);
  }

  const handleIntermitent = () => {
    setIsIntermitent(!isIntermitent);
  }

const isUpdating = useRef(false);

const handleGlobalBrightnessChange = (value:number) => {
  if (!isUpdating.current) {
    isUpdating.current = true;
    setGlobalBrightnessPercentage(value);
    setRealGlobalBrightness(value * 255);
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
  }
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LED Control</Text>
        <Text style={styles.subtitle}>Connected to: {connectionInfo.address}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.circle}>
          <LEDCircle/>
        </View>
        
        
        <View style={styles.brightnessContainer}>
          <Text style={styles.sectionTitle}>Global Brightness</Text>
          <View style={styles.buttonRow}>
            <Text style={styles.buttonText}>Requires global brightness:</Text>
            <Switch
              value={requireGlobalBrightness}
              onValueChange={setRequireGlobalBrightness}
            />
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={globalBrightnessPercentage}
            onSlidingComplete={handleGlobalBrightnessChange}
            minimumTrackTintColor="#0066cc"
            maximumTrackTintColor="#dddddd"
            disabled={!requireGlobalBrightness}
          />
          <Text style={styles.brightnessValue}>{Math.round(globalBrightnessPercentage * 100)}%</Text>
        </View>
        
        <View style={styles.functionsContainer}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'rainbow' && styles.selectedButton
              ]}
              onPress={() => handleFunction('rainbow')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'rainbow' && styles.selectedButtonText]}>Rainbow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'happy_face' && styles.selectedButton
              ]}
              onPress={() => handleFunction('happy_face')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'happy_face' && styles.selectedButtonText]}>Happy face</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'spanish_flag' && styles.selectedButton
              ]}
              onPress={() => handleFunction('spanish_flag')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'spanish_flag' && styles.selectedButtonText]}>Spanish flag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'andalusian_flag' && styles.selectedButton
              ]}
              onPress={() => handleFunction('andalusian_flag')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'andalusian_flag' && styles.selectedButtonText]}>Andalusian flag</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
          <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'italian_flag' && styles.selectedButton
              ]}
              onPress={() => handleFunction('italian_flag')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'italian_flag' && styles.selectedButtonText]}>Italian flag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === 'fill_to_empty' && styles.selectedButton
              ]}
              onPress={() => handleFunction('fill_to_empty')}
            >
              <Text style={[styles.buttonText, selectedFunction === 'fill_to_empty' && styles.selectedButtonText]}>Fill to empty</Text>
              {fillToEmptySelected? 
              <View style={styles.buttonRow}>
                <Text style={styles.sendButtonText}>Set color for function: </Text>
                
              </View> 
              : null}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.functionsContainer}>
          <Text style={styles.sectionTitle}>Functions</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
                style={[
                  styles.functionButton,
                  isFlush === true && styles.selectedButton
                ]}
                onPress={handleFlush}
              >
                <Text style={[styles.buttonText, isFlush === true && styles.selectedButtonText]}>Set flush</Text>
              </TouchableOpacity>

            <TouchableOpacity
                style={[
                  styles.functionButton,
                  isIntermitent === true && styles.selectedButton
                ]}
                onPress={handleIntermitent}
              >
                <Text style={[styles.buttonText, isIntermitent === true && styles.selectedButtonText]}>Set intermitent</Text>
              </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.sendButton} onPress={handleSendData}>
          <Text style={styles.sendButtonText}>Send Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.disconnectButton} 
          onPress={() => {
            disconnect();
            router.replace("/connect");
          }}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#0066cc'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  brightnessContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  brightnessValue: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  functionsContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10
  },
  functionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#0066cc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedButtonText: {
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#00aa00',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  disconnectButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cc0000',
  },
  circle:{
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center'
  }
});