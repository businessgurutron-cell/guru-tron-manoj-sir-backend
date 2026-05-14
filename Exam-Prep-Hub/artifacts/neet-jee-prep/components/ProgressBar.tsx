import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color,
  height = 8,
  animated = true,
}: ProgressBarProps) {
  const colors = useColors();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: Math.min(1, Math.max(0, progress)),
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(Math.min(1, Math.max(0, progress)));
    }
  }, [progress]);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.muted,
          borderRadius: height / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: color || colors.primary,
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {},
});
