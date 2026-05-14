import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
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

const { width } = Dimensions.get("window");

type Step = "role" | "details";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [exam, setExam] = useState<ExamType>("NEET");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setStep("details");
  };

  const handleFinish = async () => {
    if (!name.trim() || !role) return;
    await completeOnboarding(name.trim(), role, exam);
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#1e3a8a", "#2563eb", "#3b82f6"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Top decorative circles */}
      <View style={[styles.circle1, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
      <View style={[styles.circle2, { backgroundColor: "rgba(255,255,255,0.04)" }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: topPad + 32, paddingBottom: botPad + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo area */}
          <View style={styles.logoArea}>
            <View style={styles.logoIcon}>
              <Feather name="book-open" size={32} color="#fff" />
            </View>
            <Text style={styles.appName}>SmartPrep</Text>
            <Text style={styles.tagline}>Master NEET & JEE with AI</Text>
          </View>

          {step === "role" ? (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Who are you?</Text>
              <Text style={styles.stepSubtitle}>
                We'll personalise your experience
              </Text>

              <Pressable
                onPress={() => handleRoleSelect("student")}
                style={({ pressed }) => [
                  styles.roleCard,
                  { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.08)"]}
                  style={styles.roleCardGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.roleCardInner}>
                    <View style={[styles.roleIconWrap, { backgroundColor: "rgba(34,197,94,0.25)" }]}>
                      <Feather name="user" size={28} color="#4ade80" />
                    </View>
                    <View style={styles.roleTextBlock}>
                      <Text style={styles.roleCardTitle}>Student</Text>
                      <Text style={styles.roleCardDesc}>
                        Practice quizzes, generate papers, track your weak areas
                      </Text>
                    </View>
                    <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => handleRoleSelect("teacher")}
                style={({ pressed }) => [
                  styles.roleCard,
                  { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.08)"]}
                  style={styles.roleCardGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.roleCardInner}>
                    <View style={[styles.roleIconWrap, { backgroundColor: "rgba(251,191,36,0.25)" }]}>
                      <Feather name="users" size={28} color="#fbbf24" />
                    </View>
                    <View style={styles.roleTextBlock}>
                      <Text style={styles.roleCardTitle}>Teacher</Text>
                      <Text style={styles.roleCardDesc}>
                        Create tests, assign to students, track class performance
                      </Text>
                    </View>
                    <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.6)" />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <Pressable onPress={() => setStep("role")} style={styles.backRow}>
                <Feather name="arrow-left" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.backText}>Change role</Text>
              </Pressable>

              {/* Role pill */}
              <View style={[
                styles.rolePill,
                { backgroundColor: role === "student" ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.2)" }
              ]}>
                <Feather
                  name={role === "student" ? "user" : "users"}
                  size={14}
                  color={role === "student" ? "#4ade80" : "#fbbf24"}
                />
                <Text style={[styles.rolePillText, { color: role === "student" ? "#4ade80" : "#fbbf24" }]}>
                  {role === "student" ? "Student" : "Teacher"}
                </Text>
              </View>

              <Text style={styles.stepTitle}>
                {role === "teacher" ? "Set up your classroom" : "Let's get started"}
              </Text>
              <Text style={styles.stepSubtitle}>
                {role === "teacher"
                  ? "Enter your name to continue"
                  : "Enter your name and target exam"}
              </Text>

              {/* Name input */}
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                <TextInput
                  placeholder={role === "teacher" ? "Your name (e.g. Mr. Sharma)" : "Your name"}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                />
              </View>

              {/* Exam selector — only for students */}
              {role === "student" && (
                <View style={styles.examSection}>
                  <Text style={styles.examLabel}>Target Exam</Text>
                  <View style={styles.examRow}>
                    {(["NEET", "JEE", "BOARD"] as ExamType[]).map((e) => {
                      const active = exam === e;
                      const ec = e === "NEET" ? "#4ade80" : e === "JEE" ? "#fb923c" : "#a78bfa";
                      return (
                        <Pressable
                          key={e}
                          onPress={() => setExam(e)}
                          style={[
                            styles.examBtn,
                            {
                              backgroundColor: active ? ec + "30" : "rgba(255,255,255,0.08)",
                              borderColor: active ? ec : "rgba(255,255,255,0.15)",
                              borderWidth: active ? 2 : 1,
                            },
                          ]}
                        >
                          <Text style={[styles.examBtnText, { color: active ? ec : "rgba(255,255,255,0.55)" }]}>
                            {e}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              <Pressable
                onPress={handleFinish}
                disabled={!name.trim()}
                style={({ pressed }) => [
                  styles.finishBtn,
                  {
                    opacity: !name.trim() ? 0.4 : pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["#ffffff", "#e0e7ff"]}
                  style={styles.finishGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.finishBtnText}>
                    {role === "teacher" ? "Enter Dashboard" : "Start Preparing"}
                  </Text>
                  <Feather name="arrow-right" size={18} color="#1e3a8a" />
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Features preview */}
          <View style={styles.features}>
            {[
              { icon: "cpu", label: "AI Paper Generator" },
              { icon: "target", label: "Smart Analytics" },
              { icon: "book-open", label: "10,000+ PYQs" },
            ].map(({ icon, label }) => (
              <View key={label} style={styles.featureItem}>
                <Feather name={icon as any} size={16} color="rgba(255,255,255,0.5)" />
                <Text style={styles.featureLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -60,
  },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  appName: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 26,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },
  roleCard: {
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  roleCardGrad: {
    padding: 20,
  },
  roleCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  roleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextBlock: { flex: 1 },
  roleCardTitle: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  roleCardDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  rolePillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Inter_400Regular",
  },
  examSection: { marginBottom: 28 },
  examLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_500Medium",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  examRow: { flexDirection: "row", gap: 10 },
  examBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  examBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  finishBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  finishGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
  },
  finishBtnText: {
    fontSize: 16,
    color: "#1e3a8a",
    fontFamily: "Inter_700Bold",
  },
  features: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_400Regular",
  },
});
