import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomColorPickerModal, { Color } from './CustomColorPicker';

interface LED {
  color: string;
  brightness: number;
}

const LEDCircle: React.FC = () => {
  const [leds, setLeds] = useState<LED[]>(Array(24).fill({ color: '#FFFFFF', brightness: 1 }));
  const [selectedLedIndex, setSelectedLedIndex] = useState<number | null>(null);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  // Handle LED press
  const handleLedPress = (index: number) => {
    setSelectedLedIndex(index);
    setIsColorPickerVisible(true);
  };

  // Handle color selection from the color picker
  const handleColorSelect = (color: string, brightness: number) => {
    if (selectedLedIndex !== null) {
      const updatedLeds = [...leds];
      updatedLeds[selectedLedIndex] = { color, brightness };
      setLeds(updatedLeds);
    }
    setIsColorPickerVisible(false);
  };

  // Generate positions for 24 LEDs in a circle
  const generatePositions = (radius: number, centerX: number, centerY: number) => {
    const positions = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180); // 15 degrees between each LED
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
          ]}
          onPress={() => handleLedPress(index)}
        />
      ))}

      {/* Color Picker Modal */}
      <CustomColorPickerModal
        visible={isColorPickerVisible}
        initialColor={selectedLedIndex !== null ? new Color(leds[selectedLedIndex].color,leds[selectedLedIndex].brightness) : undefined}
        onClose={() => setIsColorPickerVisible(false)}
        onSelectColor={(color: Color) => handleColorSelect(color.c, color.b)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  led: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
});

export default LEDCircle;