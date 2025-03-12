import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import CustomColorPickerModal from "./CustomColorPicker";
import { Color } from "@/app/(tabs)/main";

interface LED {
  color: string;
  brightness: number;
}

interface LEDCircleProps {
  leds?: LED[];
  selectedLeds?: number[];
  isEditMode?: boolean;
  onLedPress?: (index: number) => void;
  disabled?: boolean; // New disabled prop
}

const LEDCircle: React.FC<LEDCircleProps> = ({
  leds: externalLeds,
  selectedLeds = [],
  isEditMode = false,
  onLedPress: externalLedPress,
  disabled = false, // Default to false
}) => {
  // Use internal state if no external leds are provided
  const [internalLeds, setInternalLeds] = useState<LED[]>(
    Array(24).fill({ color: "#FFFFFF", brightness: 1 })
  );

  const [selectedLedIndex, setSelectedLedIndex] = useState<number | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  // Use either external or internal LEDs
  const leds = externalLeds || internalLeds;

  // Handle LED press - use external handler if provided
  const handleLedPress = (index: number) => {
    if (disabled) return; // Do nothing if disabled

    if (externalLedPress) {
      externalLedPress(index);
    } else {
      setSelectedLedIndex(index);
      setIsColorPickerVisible(true);
    }
  };

  // Handle color selection from the color picker (only for internal state)
  const handleColorSelect = (color: string, brightness: number) => {
    if (selectedLedIndex !== null && !externalLeds) {
      const updatedLeds = [...internalLeds];
      updatedLeds[selectedLedIndex] = { color, brightness };
      setInternalLeds(updatedLeds);
    }
    setIsColorPickerVisible(false);
  };

  // Generate positions for 24 LEDs in a circle
  const generatePositions = (
    radius: number,
    centerX: number,
    centerY: number
  ) => {
    const positions = [];
    for (let i = 0; i < 24; i++) {
      const angle = i * 15 * (Math.PI / 180); // 15 degrees between each LED
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      positions.push({ x, y });
    }
    return positions;
  };

  const radius = 140; // Radius of the LED circle
  const centerX = radius;
  const centerY = radius;
  const positions = generatePositions(radius, centerX, centerY);

  return (
    <View style={styles.container}>
      {/* Render 24 LEDs */}
      {positions.map((pos, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.led,
            {
              backgroundColor: leds[index].color,
              opacity: leds[index].brightness,
              left: pos.x,
              top: pos.y,
            },
            // Add highlight style for selected LEDs in edit mode
            isEditMode && selectedLeds.includes(index) && styles.selectedLed,
            // Add visual indication that LEDs are disabled
            disabled && styles.disabledLed,
          ]}
          onPress={() => handleLedPress(index)}
        />
      ))}

      {/* Only show color picker for internal state management */}
      {!externalLeds && (
        <CustomColorPickerModal
          visible={isColorPickerVisible}
          initialColor={
            selectedLedIndex !== null
              ? new Color(
                  leds[selectedLedIndex].color,
                  leds[selectedLedIndex].brightness.toString()
                )
              : undefined
          }
          onClose={() => setIsColorPickerVisible(false)}
          onSelectColor={(color: Color) => handleColorSelect(color.c, Number.parseInt(color.b))}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    position: "relative",
  },
  led: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: "absolute",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedLed: {
    borderColor: "#FF4500",
    borderWidth: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 10,
  },
  disabledLed: {
    borderColor: "#cccccc",
    borderWidth: 1,
  },
});

export default LEDCircle;
