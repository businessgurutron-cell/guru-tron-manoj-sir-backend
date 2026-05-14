import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface SubjectCardProps {
  subject: string;
  questionsCount: number;
  color: string;
  bgColor: string;
  iconName: string;
  onPress: () => void;
}

export function SubjectCard({
  subject,
  questionsCount,
  color,
  bgColor,
  iconName,
  onPress,
}: SubjectCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Feather name={iconName as any} size={22} color={color} />
      </View>
      <Text style={[styles.subject, { color: colors.foreground }]}>
        {subject}
      </Text>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>
        {questionsCount} Questions
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  subject: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
