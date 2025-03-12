import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useMQTT } from "../../context/MQTTContext";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import LEDCircle from "@/components/LEDCircle";
import CustomColorPickerModal from "@/components/CustomColorPicker";

// Define Color class for better handling of color values
export class Color {
  c: string;
  b: string;

  constructor(c: string = "#FFFFFF", b: string = "255") {
    this.c = c;
    this.b = b;
  }
}

export class Fill {
  c: string;
  start: string;
  count: string;
  brightness: string;

  constructor(c: string, start: string, count: string, brightness: string) {
    this.c = c;
    this.start = start;
    this.count = count;
    this.brightness = brightness;
  }
}

export default function MainScreen() {
  const { isConnected, connectionInfo, publishData, disconnect } = useMQTT();
  const [colors, setColors] = useState(
    Array(24)
      .fill(0)
      .map(() => ({ c: "#FFFFFF", b: "-1" }))
  );
  const [fills, setFills] = useState<any[]>([]);
  const [globalBrightnessPercentage, setGlobalBrightnessPercentage] =
    useState<number>(1);
  const [realGlobalBrightness, setRealGlobalBrightness] = useState<number>(255);

  const [hasFill, setHasFill] = useState<boolean>(false);
  const [isFlush, setIsFlush] = useState<boolean>(false);
  const [isIntermitent, setIsIntermitent] = useState<boolean>(false);

  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [requireGlobalBrightness, setRequireGlobalBrightness] =
    useState<boolean>(true);
  const [defaultFunctionSelected, setDefaultFunctionSelected] =
    useState<boolean>(false);
  const [fillToEmptySelected, setFillToEmptySelected] =
    useState<boolean>(false);

  // States for color picker
  const [isColorPickerVisible, setIsColorPickerVisible] =
    useState<boolean>(false);
  const [selectedLedIndex, setSelectedLedIndex] = useState<number | null>(null);
  const [fillToEmptyColor, setFillToEmptyColor] = useState<Color>(
    new Color("#FF0000", "255")
  );

  // New state for fill all functionality
  const [fillAllColor, setFillAllColor] = useState<Color>(
    new Color("#3366FF", "255")
  );
  const [fillAllMode, setFillAllMode] = useState<boolean>(false);

  // States for "Set Fill" functionality
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedLeds, setSelectedLeds] = useState<number[]>([]);
  const [fillColor, setFillColor] = useState<Color>(
    new Color("#00FF00", "255")
  );

  const [isMounted, setIsMounted] = useState(false); // Track if the component is mounted
  const router = useRouter(); // Initialize the router

  // LED data for display
  const [leds, setLeds] = useState(
    Array(24)
      .fill(0)
      .map((_, i) => ({
        color: "#FFFFFF",
        brightness: 1.0,
      }))
  );

  useEffect(() => {
    console.log("Main screen");
  }, []);

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

  // Disable edit mode when a default function is selected
  useEffect(() => {
    if (defaultFunctionSelected && isEditMode) {
      setIsEditMode(false);
      setSelectedLeds([]);
    }
  }, [defaultFunctionSelected]);

  const [previousColors, setPreviousColors] = useState<any[]>([]);
const [previousLeds, setPreviousLeds] = useState<any[]>([]);
const [previousFills, setPreviousFills] = useState<any[]>([]);

  const handleFunction = (functionName: string) => {
    if (selectedFunction === functionName) {
      // Deselecting the current function - restore previous state
      setDefaultFunctionSelected(false);
      setSelectedFunction("");
      setFillToEmptySelected(false);
      
      // Restore previous LED configuration if available
      if (previousColors.length > 0) {
        setColors(previousColors);
        setLeds(previousLeds);
        setFills(previousFills);
      }
    } else {
      // Selecting a new function - save current state first
      if (!defaultFunctionSelected) {
        // Only save if we're not already in a default function
        setPreviousColors([...colors]);
        setPreviousLeds([...leds]);
        setPreviousFills([...fills]);
      }
      
      setDefaultFunctionSelected(true);
      setSelectedFunction(functionName);
      
      if (functionName === "fill_to_empty") {
        setFillToEmptySelected(true);
      } else {
        setFillToEmptySelected(false);
      }
      
      // Apply function presets to colors
      let updatedColors: any[] = [];
      
      if (functionName === "default") {
        // Simple white light at medium brightness
        updatedColors = Array(24).fill({ c: "#FFFFFF", b: "255" });
      } else if (functionName === "rainbow") {
        // Create a rainbow pattern around the LEDs
        const hueStep = 360 / 24; // Divide the color wheel into 24 parts
        updatedColors = Array(24).fill(0).map((_, i) => {
          const hue = (i * hueStep) % 360;
          return { 
            c: hslToHex(hue, 100, 50), 
            b: "255" 
          };
        });
      } else if (functionName === "happy_face") {
        // Define a happy face pattern
        updatedColors = Array(24).fill({ c: "#000000", b: "0" }); // Start with all LEDs off
        
        // Eyes (LEDs 4 and 19)
        updatedColors[4] = { c: "#00FFFF", b: "255" };
        updatedColors[19] = { c: "#00FFFF", b: "255" };
        
        // Smile (LEDs 7, 8, 9, 10, 11, 12)
        updatedColors[7] = { c: "#FFFF00", b: "255" };
        updatedColors[8] = { c: "#FFFF00", b: "255" };
        updatedColors[9] = { c: "#FFFF00", b: "255" };
        updatedColors[10] = { c: "#FFFF00", b: "255" };
        updatedColors[11] = { c: "#FFFF00", b: "255" };
        updatedColors[12] = { c: "#FFFF00", b: "255" };
      } else if (functionName === "spanish_flag") {
        // Spanish flag colors (red and yellow)
        updatedColors = Array(24).fill(0).map((_, i) => {
          // Top half red, bottom half yellow
          if (i >= 0 && i <= 5 || i >= 18 && i <= 23) {
            return { c: "#FF0000", b: "255" }; // Red
          } else {
            return { c: "#FFFF00", b: "255" }; // Yellow
          }
        });
      } else if (functionName === "andalusian_flag") {
        // Andalusian flag (green and white horizontal bands)
        updatedColors = Array(24).fill(0).map((_, i) => {
          if (i >= 0 && i <= 3 || i >= 12 && i <= 15) {
            return { c: "#009900", b: "255" }; // Green
          } else {
            return { c: "#FFFFFF", b: "255" }; // White
          }
        });
      } else if (functionName === "italian_flag") {
        // Italian flag (green, white, and red vertical bands)
        updatedColors = Array(24).fill(0).map((_, i) => {
          if (i === 0 || i === 1 || i === 2 || i === 3 || i === 20 || i === 21 || i === 22 || i === 23) {
            return { c: "#009900", b: "255" }; // Green 
          } else if (i === 4 || i === 5 || i === 6 || i === 7 || i === 16 || i === 17 || i === 18 || i === 19) {
            return { c: "#FFFFFF", b: "255" }; // White
          } else {
            return { c: "#FF0000", b: "255" }; // Red
          }
        });
      } else if (functionName === "fill_to_empty") {
        // Use the fillToEmptyColor for all LEDs
        updatedColors = Array(24).fill({ 
          c: fillToEmptyColor.c, 
          b: fillToEmptyColor.b 
        });
      }
      
      setColors(updatedColors);
      
      // Also update the visual LED representation
      const updatedLeds = updatedColors.map(color => ({
        color: color.c,
        brightness: Number(color.b) / 255,
      }));
      setLeds(updatedLeds);
      
      // If edit mode is active, turn it off when selecting a function
      if (isEditMode) {
        setIsEditMode(false);
        setSelectedLeds([]);
      }
    }
    
    // Helper function to convert HSL to Hex (for rainbow effect)
    function hslToHex(h: number, s: number, l: number): string {
      s /= 100;
      l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }
  };

  const handleLedPress = (index: number) => {
    if (isEditMode) {
      // In edit mode, select or deselect LEDs for fill
      if (selectedLeds.includes(index)) {
        // Deselect LED
        setSelectedLeds(selectedLeds.filter((ledIndex) => ledIndex !== index));
      } else {
        // Select LED
        setSelectedLeds([...selectedLeds, index]);
      }
    } else {
      // Normal mode - open color picker for individual LED
      setSelectedLedIndex(index);
      setIsColorPickerVisible(true);
    }
  };

  // New handler for the fill all button
  const handleFillAllPress = () => {
    setFillAllMode(true);
    setSelectedLedIndex(null);
    setIsColorPickerVisible(true);
  };

  // New function to apply the fill all color to all LEDs
  const applyFillAll = (color: string, brightness: number) => {
    // Update the visual LEDs
    const updatedLeds = Array(24)
      .fill(0)
      .map(() => ({
        color: color,
        brightness: brightness / 255,
      }));
    setLeds(updatedLeds);

    // Update colors array for backend
    const updatedColors = Array(24)
      .fill(0)
      .map(() => ({
        c: color,
        b: brightness.toString(),
      }));
    setColors(updatedColors);

    // Create a single fill that covers all LEDs
    const newFill = {
      c: color,
      start: "0",
      count: "24",
      brightness: brightness.toString(),
    };

    setFills([newFill]);
    setHasFill(true);

    Alert.alert("Fill All Applied", `Applied ${color} to all LEDs`);
  };

  const handleColorSelect = (color: string, brightness: number) => {
    if (fillAllMode) {
      // Handle fill all color selection
      setFillAllColor(new Color(color, brightness.toString()));
      applyFillAll(color, brightness);
      setFillAllMode(false);
    } else if (fillToEmptySelected && selectedLedIndex === null) {
      // Update fill to empty color
      setFillToEmptyColor(new Color(color, brightness.toString()));
    } else if (isEditMode && selectedLeds.length > 0) {
      // Update fill color for selected LEDs
      setFillColor(new Color(color, brightness.toString()));
    } else if (selectedLedIndex !== null) {
      // Update individual LED color
      const updatedLeds = [...leds];
      updatedLeds[selectedLedIndex] = {
        color: color,
        brightness: brightness / 255,
      };
      setLeds(updatedLeds);

      // Update colors array for backend
      const updatedColors = [...colors];
      updatedColors[selectedLedIndex] = { c: color, b: brightness.toString() };
      setColors(updatedColors);
    }

    setIsColorPickerVisible(false);
    setSelectedLedIndex(null);
  };

  const handleApplyFill = () => {
    if (selectedLeds.length === 0) {
      Alert.alert(
        "No LEDs Selected",
        "Please select at least one LED for the fill."
      );
      return;
    }

    // Update leds visual state
    const updatedLeds = [...leds];
    selectedLeds.forEach((index) => {
      updatedLeds[index] = {
        color: fillColor.c,
        brightness: Number.parseInt(fillColor.b) / 255,
      };
    });
    setLeds(updatedLeds);

    // Update colors array for backend
    const updatedColors = [...colors];
    selectedLeds.forEach((index) => {
      updatedColors[index] = { c: fillColor.c, b: fillColor.b.toString() };
    });
    setColors(updatedColors);

    // Create a new fill entry
    const newFill = {
      c: fillColor.c,
      start: Math.min(...selectedLeds),
      count: selectedLeds.length,
      brightness: fillColor.b,
    };

    setFills([...fills, newFill]);
    setHasFill(true);

    // Exit edit mode and clear selection
    setIsEditMode(false);
    setSelectedLeds([]);

    Alert.alert(
      "Fill Applied",
      `Applied ${fillColor.c} to ${selectedLeds.length} LEDs`
    );
  };

  // Function to recalculate fills based on LED data
  function recalculateFills(ledsData: Record<string, Color>): Fill[] {
    const fills: Fill[] = [];
    let currentFill: Fill | undefined = undefined;

    // Sort LED indices numerically
    const ledIndices = Object.keys(ledsData)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < ledIndices.length; i++) {
      const ledIndex = ledIndices[i];
      const led = ledsData[ledIndex.toString()];

      // Skip LEDs with no color data or special values
      if (!led || !led.c || led.c === "-1" || !led.b || led.b === "-1")
        continue;

      // Check if we can extend the current fill
      if (
        currentFill &&
        led.c === currentFill.c &&
        led.b === currentFill.brightness &&
        ledIndex === parseInt(currentFill.start) + parseInt(currentFill.count)
      ) {
        // Extend current fill
        currentFill.count = (parseInt(currentFill.count) + 1).toString();
      } else {
        // If we have a current fill and it has at least 2 LEDs, save it
        if (currentFill && parseInt(currentFill.count) >= 2) {
          fills.push({ ...currentFill });
        }

        // Start a potential new fill
        currentFill = {
          c: led.c,
          start: ledIndex.toString(),
          count: "1",
          brightness: led.b,
        };
      }
    }

    // Don't forget to add the last fill if it has at least 2 LEDs
    if (currentFill && parseInt(currentFill.count) >= 2) {
      fills.push({ ...currentFill });
    }

    return fills;
  }

  // After calculating fills, update ledsData to mark LEDs in fills
  function updateLedsWithFillInfo(
    ledsData: Record<string, Color>,
    fills: Fill[]
  ) {
    // Create a copy to avoid mutating the original
    const updatedLedsData = { ...ledsData };

    // Mark LEDs covered by fills with special values
    for (const fill of fills) {
      const start = parseInt(fill.start);
      const count = parseInt(fill.count);

      for (let i = start; i < start + count; i++) {
        if (updatedLedsData[i.toString()]) {
          updatedLedsData[i.toString()] = { c: "-1", b: "-1" };
        }
      }
    }

    return updatedLedsData;
  }

  // Format fills for data transmission
  function formatFillsForTransmission(fills: Fill[]) {
    let fillsData: Record<string, Fill> = {};

    fills.forEach((fill, index) => {
      fillsData[index.toString()] = {
        c: fill.c,
        start: fill.start.toString(),
        count: fill.count.toString(),
        brightness: fill.brightness.toString(),
      };
    });

    return fillsData;
  }

  // Integration function to optimize LED data
  function optimizeLEDData(ledsData: Record<string, Color>) {
    // Calculate fills from LED data
    const fills = recalculateFills(ledsData);

    // If we found fills, update the LED data accordingly
    const hasFills = fills.length > 0;
    let updatedLedsData = ledsData;
    let formattedFills = {};

    if (hasFills) {
      updatedLedsData = updateLedsWithFillInfo(ledsData, fills);
      formattedFills = formatFillsForTransmission(fills);
    }

    return {
      leds: updatedLedsData,
      has_fill: hasFills,
      fills: formattedFills,
    };
  }

  const handleSendData = () => {
    // Base topic
    const baseTopic = "topic/lamp/";
    const defaultFunctionsPath = "default_functions/";

    // First, prepare the individual LED data
    let ledsData: Record<string, Color> = {};
    colors.forEach((color, index) => {
      ledsData[index.toString()] = {
        c: color ? color.c || "#FFFFFF" : "#FFFFFF",
        b: color ? (color.b === "-1" ? "-1" : color.b) : "-1",
      };
    });

    // Determine what to send based on selected function or custom settings
    let topic = "";
    let message = "";

    if (defaultFunctionSelected && selectedFunction !== "") {
      // For default functions
      topic = baseTopic + defaultFunctionsPath;

      if (selectedFunction === "fill_to_empty") {
        // Special format for fill_to_empty: "fill_to_empty/color=HEX"
        message = `full_to_empty/color=${fillToEmptyColor.c}`;
        // If brightness is specified, we could add it to the message if needed
        // if (fillToEmptyColor.b !== "-1") {
        //   message += `/brightness=${fillToEmptyColor.b}`;
        // }
      } else {
        // For other default functions like "happy_face", etc.
        message = selectedFunction;
      }

      // Publish the message string
      const success = publishData(topic, message);

      if (success) {
        Alert.alert("Success", "Data sent successfully!");
      } else {
        Alert.alert(
          "Error",
          "Failed to send data. Please check your MQTT connection."
        );
      }

      return;
    } else {
      // For custom LED configurations
      topic = baseTopic + "json_function/";

      // Optimize the LED data first
      const optimizedData = optimizeLEDData(ledsData);

      // Format the data
      const jsonData = formatLEDDataForTransmission(
        optimizedData.leds,
        Object.values(optimizedData.fills || {}),
        isFlush,
        isIntermitent,
        realGlobalBrightness
      );

      // Publish the data with the correct topic
      const success = publishData(topic, jsonData);

      if (success) {
        Alert.alert("Success", "Data sent successfully!");
      } else {
        Alert.alert(
          "Error",
          "Failed to send data. Please check your MQTT connection."
        );
      }
    }
  };

  // This function ensures the LED data follows the required structure
  function formatLEDDataForTransmission(
    ledsData: Record<string, Color>,
    fills: Fill[],
    isFlush: boolean,
    isIntermitent: boolean,
    globalBrightness: number
  ): any {
    // 1. Initialize the complete LED structure with all indices 0-23
    let formattedLeds: Record<string, any> = {};
    for (let i = 0; i < 24; i++) {
      // Default each LED to preserve previous values (-1)
      formattedLeds[i.toString()] = {
        c: "-1",
        b: "-1",
      };
    }

    // 2. Apply the actual LED data we have
    Object.keys(ledsData).forEach((index) => {
      const led = ledsData[index];
      if (led) {
        formattedLeds[index] = {
          c: led.c || "-1",
          b: led.b || "-1",
        };
      }
    });

    // 3. Format fills for transmission
    let formattedFills: Record<string, any> = {};
    fills.forEach((fill, index) => {
      formattedFills[index.toString()] = {
        c: fill.c,
        start: fill.start.toString(),
        count: fill.count.toString(),
        brightness: fill.brightness.toString(),
      };
    });

    // 4. Return the complete data structure
    return {
      leds: formattedLeds,
      has_fill: fills.length > 0,
      fills: formattedFills,
      is_flush: isFlush,
      is_intermitent: isIntermitent,
      global_b: globalBrightness.toString(),
    };
  }

  const handleFlush = () => {
    setIsFlush(!isFlush);
  };

  const handleIntermitent = () => {
    setIsIntermitent(!isIntermitent);
  };

  const toggleEditMode = () => {
    // Don't allow edit mode when a default function is selected
    if (defaultFunctionSelected) {
      Alert.alert(
        "Function Selected",
        "Cannot enter edit mode while a function is selected. Please deselect the function first."
      );
      return;
    }

    // Toggle edit mode
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);

    // If turning off edit mode, clear selected LEDs
    if (!newEditMode) {
      setSelectedLeds([]);
    }
  };

  const handleFillToEmptyColorPicker = () => {
    setSelectedLedIndex(null); // Not selecting a specific LED
    setIsColorPickerVisible(true);
  };

  const handleFillColorPicker = () => {
    setSelectedLedIndex(null); // Not selecting a specific LED
    setIsColorPickerVisible(true);
  };

  const isUpdating = useRef(false);

  const handleGlobalBrightnessChange = (value: number) => {
    if (!isUpdating.current) {
      isUpdating.current = true;
      setGlobalBrightnessPercentage(value);
      setRealGlobalBrightness(value * 255);
      setTimeout(() => {
        isUpdating.current = false;
      }, 0);
    }
  };

  // Modified handler for the Clear All button - now fills with white
const handleClearAll = () => {
  // Update the visual LEDs
  const updatedLeds = Array(24)
    .fill(0)
    .map(() => ({
      color: "#FFFFFF", // White color
      brightness: 1.0, // Full brightness
    }));
  setLeds(updatedLeds);

  // Update colors array for backend
  const updatedColors = Array(24)
    .fill(0)
    .map(() => ({
      c: "#FFFFFF", // White color
      b: "255", // Full brightness value
    }));
  setColors(updatedColors);

  // Create a single fill that covers all LEDs
  const newFill = {
    c: "#FFFFFF",
    start: "0",
    count: "24",
    brightness: "255",
  };

  setFills([newFill]);
  setHasFill(true);

  Alert.alert("All LEDs Reset", "Set all LEDs to white");
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LED Control</Text>
        <Text style={styles.subtitle}>
          Connected to: {connectionInfo.address}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.circle}>
          {/* Add the Fill All button in the center of the circle */}
          <View style={styles.circleWrapper}>
            <LEDCircle
              leds={leds}
              selectedLeds={selectedLeds}
              isEditMode={isEditMode}
              onLedPress={handleLedPress}
              disabled={defaultFunctionSelected}
            />
            <TouchableOpacity
              style={styles.fillAllButton}
              onPress={handleFillAllPress}
              disabled={defaultFunctionSelected}
            >
              <Text style={styles.fillAllButtonText}>Fill All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAll}
              disabled={defaultFunctionSelected}
            >
              <Text style={styles.clearAllButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.brightnessValue}>
            {Math.round(globalBrightnessPercentage * 100)}%
          </Text>
        </View>

        <View style={styles.functionsContainer}>
          <Text style={styles.sectionTitle}>Presets</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "rainbow" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("rainbow")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "rainbow" && styles.selectedButtonText,
                ]}
              >
                Rainbow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "happy_face" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("happy_face")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "happy_face" &&
                    styles.selectedButtonText,
                ]}
              >
                Happy face
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "spanish_flag" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("spanish_flag")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "spanish_flag" &&
                    styles.selectedButtonText,
                ]}
              >
                Spanish flag
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "andalusian_flag" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("andalusian_flag")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "andalusian_flag" &&
                    styles.selectedButtonText,
                ]}
              >
                Andalusian flag
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "italian_flag" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("italian_flag")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "italian_flag" &&
                    styles.selectedButtonText,
                ]}
              >
                Italian flag
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                selectedFunction === "fill_to_empty" && styles.selectedButton,
              ]}
              onPress={() => handleFunction("fill_to_empty")}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedFunction === "fill_to_empty" &&
                    styles.selectedButtonText,
                ]}
              >
                Fill to empty
              </Text>
            </TouchableOpacity>
          </View>

          {fillToEmptySelected && (
            <View style={styles.colorSelectorContainer}>
              <Text style={styles.colorSelectorText}>
                Set color for Fill to Empty:
              </Text>
              <View style={styles.colorPreviewRow}>
                <TouchableOpacity
                  style={[
                    styles.colorPreview,
                    { backgroundColor: fillToEmptyColor.c },
                  ]}
                  onPress={handleFillToEmptyColorPicker}
                />
                <Text style={styles.colorBrightness}>
                  Brightness:{" "}
                  {Math.round(
                    (Number.parseInt(fillToEmptyColor.b) / 255) * 100
                  )}
                  %
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.functionsContainer}>
          <Text style={styles.sectionTitle}>Fill Mode</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                isEditMode && styles.selectedButton,
                defaultFunctionSelected && styles.disabledButton,
              ]}
              onPress={toggleEditMode}
              disabled={defaultFunctionSelected}
            >
              <Text
                style={[
                  styles.buttonText,
                  isEditMode && styles.selectedButtonText,
                  defaultFunctionSelected && styles.disabledButtonText,
                ]}
              >
                {isEditMode ? "Exit Set Fill" : "Set Fill"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                isEditMode && styles.applyButton,
                (defaultFunctionSelected ||
                  !isEditMode ||
                  selectedLeds.length === 0) &&
                  styles.disabledButton,
              ]}
              onPress={handleApplyFill}
              disabled={
                defaultFunctionSelected ||
                !isEditMode ||
                selectedLeds.length === 0
              }
            >
              <Text
                style={[
                  styles.buttonText,
                  isEditMode && styles.applyButtonText,
                  (defaultFunctionSelected ||
                    !isEditMode ||
                    selectedLeds.length === 0) &&
                    styles.disabledButtonText,
                ]}
              >
                Apply Fill
              </Text>
            </TouchableOpacity>
          </View>

          {isEditMode && (
            <View style={styles.colorSelectorContainer}>
              <Text style={styles.colorSelectorText}>
                Selected LEDs: {selectedLeds.length}
                {selectedLeds.length > 0 && ` (${selectedLeds.join(", ")})`}
              </Text>
              <Text style={styles.colorSelectorText}>Set fill color:</Text>
              <View style={styles.colorPreviewRow}>
                <TouchableOpacity
                  style={[
                    styles.colorPreview,
                    { backgroundColor: fillColor.c },
                  ]}
                  onPress={handleFillColorPicker}
                />
                <Text style={styles.colorBrightness}>
                  Brightness:{" "}
                  {Math.round((Number.parseInt(fillColor.b) / 255) * 100)}%
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.functionsContainer}>
          <Text style={styles.sectionTitle}>Functions</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.functionButton,
                isFlush === true && styles.selectedButton,
              ]}
              onPress={handleFlush}
            >
              <Text
                style={[
                  styles.buttonText,
                  isFlush === true && styles.selectedButtonText,
                ]}
              >
                Set flush
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.functionButton,
                isIntermitent === true && styles.selectedButton,
              ]}
              onPress={handleIntermitent}
            >
              <Text
                style={[
                  styles.buttonText,
                  isIntermitent === true && styles.selectedButtonText,
                ]}
              >
                Set intermitent
              </Text>
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

      {/* Color Picker Modal */}
      <CustomColorPickerModal
        visible={isColorPickerVisible}
        initialColor={
          fillAllMode
            ? fillAllColor
            : selectedLedIndex !== null
            ? new Color(
                leds[selectedLedIndex].color,
                (leds[selectedLedIndex].brightness * 255).toString()
              )
            : isEditMode
            ? fillColor
            : fillToEmptyColor
        }
        onClose={() => {
          setIsColorPickerVisible(false);
          setFillAllMode(false);
        }}
        onSelectColor={(color: Color) =>
          handleColorSelect(color.c, Number.parseInt(color.b))
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#0066cc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#e0e0e0",
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  brightnessContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  brightnessValue: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  functionsContainer: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  functionButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#0066cc",
  },
  disabledButton: {
    backgroundColor: "#e0e0e0",
    opacity: 0.7,
  },
  applyButton: {
    backgroundColor: "#00aa00",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  selectedButtonText: {
    color: "#fff",
  },
  disabledButtonText: {
    color: "#999",
  },
  applyButtonText: {
    color: "#fff",
  },
  sendButton: {
    backgroundColor: "#00aa00",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  disconnectButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#cc0000",
  },
  circle: {
    paddingBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  circleWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  fillAllButton: {
    position: "absolute",
    backgroundColor: "#0066cc",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
    top: 50
  },
  fillAllButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  colorSelectorContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  colorSelectorText: {
    fontSize: 14,
    marginBottom: 8,
  },
  colorPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 15,
  },
  colorBrightness: {
    fontSize: 14,
  },
  led: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  clearAllButton: {
    position: "absolute",
    backgroundColor: "#cccccc",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
    bottom: 30,
  },
  clearAllButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  }
});
