import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';

interface ColorWheelProps {
  onColorChange: (hsv: { h: number; s: number; v: number }) => void;
  size?: number;
}

const ColorWheel: React.FC<ColorWheelProps> = ({ onColorChange, size = 200 }) => {
  const [color, setColor] = useState({ h: 0, s: 1, v: 1 });

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: handleColorChange,
      onPanResponderMove: handleColorChange,
    })
  ).current;

  function handleColorChange(e: GestureResponderEvent) {
    const { locationX, locationY } = e.nativeEvent;
    const centerX = size / 2;
    const centerY = size / 2;

    // Calculate hue and saturation from touch position
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    const d = Math.sqrt(dx * dx + dy * dy);

    const saturation = Math.min(1, d / (size / 2));
    let hue = (Math.atan2(dy, dx) * (180 / Math.PI));
    if (hue < 0) hue += 360;
    hue = hue / 360; // Normalize to [0, 1]

    const newColor = { h: hue, s: saturation, v: color.v };
    setColor(newColor);
    onColorChange(newColor);
  }

  // Convert HSV to Hex
  const hsvToHex = (h: number, s: number, v: number): string => {
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
  };

  return (
    <View
      style={[styles.colorWheel, { width: size, height: size }]}
      {...panResponder.panHandlers}
    >
      <Svg width={size} height={size}>
        <Defs>
          {/* Radial gradient for saturation overlay */}
          <RadialGradient id="saturationOverlay" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="white" stopOpacity="1" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </RadialGradient>

          {/* Conic gradient for the color wheel */}
          {Array.from({ length: 360 }).map((_, i) => (
            <Stop
              key={i}
              offset={`${(i / 360) * 100}%`}
              stopColor={hsvToHex(i / 360, 1, 1)}
            />
          ))}
        </Defs>

        {/* Color wheel */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill="url(#colorWheelGradient)"
        />

        {/* Saturation overlay */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill="url(#saturationOverlay)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  colorWheel: {
    borderRadius: 100, // Make it circular
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    position: 'relative',
  },
});

export default ColorWheel;