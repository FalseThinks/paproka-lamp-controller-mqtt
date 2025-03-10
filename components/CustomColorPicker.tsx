import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import ColorWheel from './ColorWheel';

export class Color {
  c: string;
  b: number;
  constructor(c: string, b: number) {
    this.c = c;
    this.b = b;
  }
}

interface ColorPickerModalProps {
  visible: boolean;
  initialColor?: Color;
  onClose: () => void;
  onSelectColor: (color: Color) => void;
}

const CustomColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  initialColor,
  onClose,
  onSelectColor,
}) => {
  const [selectedColor, setSelectedColor] = useState<Color>(new Color('#FFFFFF', 1));
  const [brightness, setBrightness] = useState(1);

  useEffect(() => {
    if (initialColor) {
      setSelectedColor(initialColor);
      setBrightness(initialColor.b);
    }
  }, [initialColor, visible]);

  const handleColorChange = (hsv: { h: number; s: number; v: number }) => {
    const color = hsvToHex(hsv.h, hsv.s, hsv.v);
    setSelectedColor({
      ...selectedColor,
      c: color,
    });
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    setSelectedColor({
      ...selectedColor,
      b: value,
    });
  };

  const handleConfirm = () => {
    onSelectColor(selectedColor);
    onClose();
  };

  function hsvToHex(h: number, s: number, v: number): string {
    let r: number, g: number, b: number;
  
    const i = Math.floor(h * 6); // Sector index (0 to 5)
    const f = h * 6 - i; // Fractional part of h
    const p = v * (1 - s); // Primary value
    const q = v * (1 - f * s); // Secondary value
    const t = v * (1 - (1 - f) * s); // Tertiary value
  
    // Calculate RGB based on the sector
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break; // Red to Yellow
      case 1: r = q, g = v, b = p; break; // Yellow to Green
      case 2: r = p, g = v, b = t; break; // Green to Cyan
      case 3: r = p, g = q, b = v; break; // Cyan to Blue
      case 4: r = t, g = p, b = v; break; // Blue to Magenta
      case 5: r = v, g = p, b = q; break; // Magenta to Red
      default: r = 0, g = 0, b = 0; // Fallback (should never happen)
    }
  
    // Convert RGB values (0-1) to hex (00-FF)
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex; // Ensure two digits
    };
  
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Select Color</Text>

          <ColorWheel size={200} onColorChange={handleColorChange} />

          <View style={styles.brightnessContainer}>
            <Text style={styles.brightnessLabel}>Brightness</Text>
            <Slider
              style={styles.brightnessSlider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={brightness}
              onSlidingComplete={handleBrightnessChange}
              minimumTrackTintColor="#0066cc"
              maximumTrackTintColor="#dddddd"
            />
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: selectedColor.c, opacity: selectedColor.b },
              ]}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  brightnessContainer: {
    width: '100%',
    marginTop: 20,
  },
  brightnessLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  brightnessSlider: {
    width: '100%',
    height: 40,
  },
  previewContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  colorPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#0066cc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default CustomColorPickerModal;