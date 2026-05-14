import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import type { ExamType, Role } from "@/context/AppContext";

const EXAM_TYPES: ExamType[] = ["NEET", "JEE", "BOARD"];
const ROLES: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, attempts, papers } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

  const handleSwitchRole = () => {
    Alert.alert(
      "Switch Role",
      "This will take you back to the login screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: () => {
            updateProfile({ isOnboarded: false });
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const examColor =
    profile.targetExam === "NEET"
      ? colors.neet
      : profile.targetExam === "JEE"
        ? colors.jee
        : colors.board;

  const menuItems = [
    {
      icon: "user",
      label: "Role",
      value: profile.role === "student" ? "Student" : "Teacher",
    },
    {
      icon: "target",
      label: "Target Exam",
      value: profile.targetExam,
    },
    {
      icon: "book-open",
      label: "Papers Generated",
      value: String(papers.length),
    },
    {
      icon: "check-circle",
      label: "Quizzes Attempted",
      value: String(attempts.length),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + Name */}
      <View style={styles.avatarSection}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
        >
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {editingName ? (
          <View style={styles.nameEdit}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={[
                styles.nameInput,
                {
                  color: colors.foreground,
                  borderColor: colors.primary,
                  backgroundColor: colors.card,
                },
              ]}
              autoFocus
              onSubmitEditing={handleSaveName}
            />
            <Pressable
              onPress={handleSaveName}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setEditingName(true)}
            style={styles.nameRow}
          >
            <Text style={[styles.name, { color: colors.foreground }]}>
              {profile.name}
            </Text>
            <Feather name="edit-2" size={16} color={colors.mutedForeground} />
          </Pressable>
        )}
        <View style={[styles.examBadge, { backgroundColor: examColor + "20" }]}>
          <Text style={[styles.examBadgeText, { color: examColor }]}>
            {profile.targetExam} Aspirant
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.primary }]}>
            {profile.streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Day Streak
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.jee }]}>
            {profile.totalPoints}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Points
          </Text>
        </View>
        <View
          style={[
            styles.statBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statVal, { color: colors.neet }]}>
            #{profile.rank}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Rank
          </Text>
        </View>
      </View>

      {/* Role Selection */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          I am a
        </Text>
        <View style={styles.roleRow}>
          {ROLES.map(({ value, label }) => (
            <Pressable
              key={value}
              onPress={() => updateProfile({ role: value })}
              style={[
                styles.roleBtn,
                {
                  backgroundColor:
                    profile.role === value
                      ? colors.primary
                      : colors.secondary,
                  borderColor:
                    profile.role === value ? colors.primary : colors.border,
                },
              ]}
            >
              <Feather
                name={value === "student" ? "user" : "users"}
                size={16}
                color={profile.role === value ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.roleText,
                  {
                    color:
                      profile.role === value ? "#fff" : colors.mutedForeground,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Exam Selection */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Target Exam
        </Text>
        <View style={styles.examRow}>
          {EXAM_TYPES.map((exam) => {
            const ec =
              exam === "NEET"
                ? colors.neet
                : exam === "JEE"
                  ? colors.jee
                  : colors.board;
            const eb =
              exam === "NEET"
                ? colors.neetLight
                : exam === "JEE"
                  ? colors.jeeLight
                  : colors.boardLight;
            return (
              <Pressable
                key={exam}
                onPress={() => updateProfile({ targetExam: exam })}
                style={[
                  styles.examBtn,
                  {
                    backgroundColor:
                      profile.targetExam === exam ? eb : colors.secondary,
                    borderColor:
                      profile.targetExam === exam ? ec : colors.border,
                    borderWidth: profile.targetExam === exam ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.examBtnText,
                    {
                      color: profile.targetExam === exam ? ec : colors.mutedForeground,
                      fontFamily:
                        profile.targetExam === exam
                          ? "Inter_700Bold"
                          : "Inter_400Regular",
                    },
                  ]}
                >
                  {exam}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Info rows */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {menuItems.map((item, i) => (
          <View
            key={item.label}
            style={[
              styles.menuRow,
              i < menuItems.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.menuLeft}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Feather
                  name={item.icon as any}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>
                {item.label}
              </Text>
            </View>
            <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Reset */}
      <Pressable
        onPress={() =>
          Alert.alert("Reset Progress", "This will clear all your quiz history.", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: () => {} },
          ])
        }
        style={({ pressed }) => [
          styles.resetBtn,
          {
            borderColor: colors.destructive,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="trash-2" size={16} color={colors.destructive} />
        <Text style={[styles.resetText, { color: colors.destructive }]}>
          Reset Progress
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontFamily: "Inter_700Bold" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  nameEdit: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    width: 180,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  examBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  examBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 2 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  roleRow: { flexDirection: "row", gap: 10 },
  roleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  examRow: { flexDirection: "row", gap: 8 },
  examBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  examBtnText: { fontSize: 14 },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  menuValue: { fontSize: 13, fontFamily: "Inter_400Regular" },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 4,
    marginBottom: 8,
  },
  resetText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
