import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface QuizCardProps {
  title: string;
  subject: string;
  questionsCount: number;
  timeLimit: number;
  difficulty: string;
  tag?: string;
  tagColor?: string;
  tagBg?: string;
  onPress: () => void;
}

export function QuizCard({
  title,
  subject,
  questionsCount,
  timeLimit,
  difficulty,
  tag,
  tagColor,
  tagBg,
  onPress,
}: QuizCardProps) {
  const colors = useColors();

  const diffColor =
    difficulty === "Easy"
      ? colors.neet
      : difficulty === "Moderate"
        ? colors.jee
        : colors.destructive;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {title}
          </Text>
        </View>
        {tag && (
          <View style={[styles.tag, { backgroundColor: tagBg }]}>
            <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.subject, { color: colors.mutedForeground }]}>
        {subject}
      </Text>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Feather name="help-circle" size={13} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {questionsCount} Qs
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {timeLimit} min
          </Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
          <Text style={[styles.diffText, { color: diffColor }]}>{difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleRow: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 22,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  subject: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: "auto",
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
