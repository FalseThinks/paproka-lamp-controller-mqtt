import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, GestureResponderEvent } from "react-native";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Circle,
  Path,
} from "react-native-svg";

interface ColorWheelProps {
  onColorChange: (hsv: { h: number; s: number; v: number }) => void;
  size?: number;
}

const ColorWheel: React.FC<ColorWheelProps> = ({
  onColorChange,
  size = 200,
}) => {
  const [color, setColor] = useState({ h: 0, s: 1, v: 1 });
  const radius = size / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Convert HSV to Hex
  const hsvToHex = useCallback((h: number, s: number, v: number): string => {
    let r: number, g: number, b: number;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        (r = v), (g = t), (b = p);
        break;
      case 1:
        (r = q), (g = v), (b = p);
        break;
      case 2:
        (r = p), (g = v), (b = t);
        break;
      case 3:
        (r = p), (g = q), (b = v);
        break;
      case 4:
        (r = t), (g = p), (b = v);
        break;
      case 5:
        (r = v), (g = p), (b = q);
        break;
      default:
        (r = 0), (g = 0), (b = 0);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }, []);

  // Handle touch events
  const handleTouch = useCallback(
    (event: GestureResponderEvent) => {
      // Get the touch location relative to the component
      const locationX = event.nativeEvent.locationX;
      const locationY = event.nativeEvent.locationY;

      // Calculate distance from center
      const dx = locationX - centerX;
      const dy = locationY - centerY;
      const d = Math.sqrt(dx * dx + dy * dy);

      // Calculate saturation (distance from center)
      const saturation = Math.min(1, d / radius);

      // Calculate hue (angle)
      let hue = Math.atan2(dy, dx) * (180 / Math.PI);
      if (hue < 0) hue += 360;

      const newColor = { h: hue / 360, s: saturation, v: color.v };
      setColor(newColor);
      onColorChange(newColor);
    },
    [centerX, centerY, radius, color.v, onColorChange]
  );

  // Create color wheel segments
  const renderColorWheelSegments = useCallback(() => {
    const segments = [];
    const segmentCount = 36;
    const segmentAngle = 360 / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const startX = centerX + radius * Math.cos(startRad);
      const startY = centerY + radius * Math.sin(startRad);
      const endX = centerX + radius * Math.cos(endRad);
      const endY = centerY + radius * Math.sin(endRad);

      const segmentColor = hsvToHex(startAngle / 360, 1, 1);

      segments.push(
        <Path
          key={i}
          d={`M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY} Z`}
          fill={segmentColor}
        />
      );
    }
    return segments;
  }, [centerX, centerY, radius, hsvToHex]);

  // Calculate color indicator position
  const getColorIndicatorPosition = useCallback(() => {
    const hueRad = ((color.h * 360 - 90) * Math.PI) / 180;
    return {
      x: centerX + color.s * radius * Math.cos(hueRad),
      y: centerY + color.s * radius * Math.sin(hueRad),
    };
  }, [centerX, centerY, radius, color.h, color.s]);

  const colorWheelSegments = useMemo(
    () => renderColorWheelSegments(),
    [renderColorWheelSegments]
  );
  const indicatorPosition = getColorIndicatorPosition();

  return (
    <View style={[styles.colorWheel, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <Defs>
          <RadialGradient id="saturationOverlay" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="white" stopOpacity="1" />
            <Stop offset="100%" stopColor="white" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {colorWheelSegments}

        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="url(#saturationOverlay)"
          fillOpacity="1"
        />

        <Circle
          cx={indicatorPosition.x}
          cy={indicatorPosition.y}
          r={10}
          stroke="white"
          strokeWidth={2}
          fill={hsvToHex(color.h, color.s, color.v)}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  colorWheel: {
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    position: "relative",
  },
});

export default ColorWheel;
