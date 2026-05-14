import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { getQuestions, TOPICS_BY_SUBJECT } from "@/data/questions";
import type { Difficulty, ExamType, Subject } from "@/context/AppContext";

type QuestionType = "MCQ" | "Assertion-Reason" | "Case-Based";

export default function GeneratePaperScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPaper } = useApp();

  const [examType, setExamType] = useState<ExamType>("NEET");
  const [subject, setSubject] = useState<Subject>("Biology");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState<Difficulty>("Moderate");
  const [questionType, setQuestionType] = useState<QuestionType>("MCQ");
  const [questionCount, setQuestionCount] = useState(15);
  const [generating, setGenerating] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const subjects: Subject[] =
    examType === "NEET"
      ? ["Biology", "Physics", "Chemistry"]
      : examType === "JEE"
        ? ["Physics", "Chemistry", "Mathematics"]
        : ["Physics", "Chemistry", "Biology", "Mathematics"];

  const topics = ["All", ...(TOPICS_BY_SUBJECT[subject] || [])];

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));

    const questions = getQuestions(subject, topic, difficulty, examType, questionCount);
    const paperTitle = `${examType} ${subject} — ${topic === "All" ? "Mixed Topics" : topic}`;

    const paper = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      title: paperTitle,
      examType,
      subject,
      topic,
      difficulty,
      questions,
      createdAt: new Date().toISOString(),
    };

    addPaper(paper);
    setGenerating(false);
    router.replace({
      pathname: "/paper/[id]",
      params: { id: paper.id },
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>
          Generate Paper
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 24,
          },
        ]}
      >
        <View
          style={[
            styles.aiCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <Feather name="cpu" size={24} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI Paper Generator</Text>
            <Text style={styles.aiDesc}>
              Auto-generates questions in NEET/JEE pattern
            </Text>
          </View>
        </View>

        <SelectorSection title="Exam Type">
          <SelectorRow>
            {(["NEET", "JEE", "BOARD"] as ExamType[]).map((e) => {
              const ec =
                e === "NEET"
                  ? colors.neet
                  : e === "JEE"
                    ? colors.jee
                    : colors.board;
              const eb =
                e === "NEET"
                  ? colors.neetLight
                  : e === "JEE"
                    ? colors.jeeLight
                    : colors.boardLight;
              return (
                <Pill
                  key={e}
                  label={e}
                  active={examType === e}
                  activeColor={ec}
                  activeBg={eb}
                  onPress={() => {
                    setExamType(e);
                    setSubject(
                      e === "NEET"
                        ? "Biology"
                        : e === "JEE"
                          ? "Physics"
                          : "Physics"
                    );
                    setTopic("All");
                  }}
                  colors={colors}
                />
              );
            })}
          </SelectorRow>
        </SelectorSection>

        <SelectorSection title="Subject">
          <SelectorRow>
            {subjects.map((s) => (
              <Pill
                key={s}
                label={s}
                active={subject === s}
                onPress={() => {
                  setSubject(s);
                  setTopic("All");
                }}
                colors={colors}
              />
            ))}
          </SelectorRow>
        </SelectorSection>

        <SelectorSection title="Topic">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SelectorRow>
              {topics.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  active={topic === t}
                  onPress={() => setTopic(t)}
                  colors={colors}
                />
              ))}
            </SelectorRow>
          </ScrollView>
        </SelectorSection>

        <SelectorSection title="Difficulty">
          <SelectorRow>
            {(["Easy", "Moderate", "Hard"] as Difficulty[]).map((d) => {
              const dc =
                d === "Easy"
                  ? colors.neet
                  : d === "Moderate"
                    ? colors.jee
                    : colors.destructive;
              return (
                <Pill
                  key={d}
                  label={d}
                  active={difficulty === d}
                  activeColor={dc}
                  activeBg={dc + "20"}
                  onPress={() => setDifficulty(d)}
                  colors={colors}
                />
              );
            })}
          </SelectorRow>
        </SelectorSection>

        <SelectorSection title="Question Type">
          <SelectorRow wrap>
            {(["MCQ", "Assertion-Reason", "Case-Based"] as QuestionType[]).map(
              (qt) => (
                <Pill
                  key={qt}
                  label={qt}
                  active={questionType === qt}
                  onPress={() => setQuestionType(qt)}
                  colors={colors}
                />
              )
            )}
          </SelectorRow>
        </SelectorSection>

        <SelectorSection title={`Number of Questions: ${questionCount}`}>
          <View style={styles.countRow}>
            {[5, 10, 15, 20, 30].map((n) => (
              <Pressable
                key={n}
                onPress={() => setQuestionCount(n)}
                style={[
                  styles.countBtn,
                  {
                    backgroundColor:
                      questionCount === n ? colors.primary : colors.secondary,
                    borderColor:
                      questionCount === n ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    {
                      color:
                        questionCount === n
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
        </SelectorSection>

        {/* Summary */}
        <View
          style={[
            styles.summary,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
            Paper Summary
          </Text>
          {[
            { label: "Exam", value: examType },
            { label: "Subject", value: subject },
            { label: "Topic", value: topic },
            { label: "Difficulty", value: difficulty },
            { label: "Type", value: questionType },
            { label: "Questions", value: String(questionCount) },
          ].map(({ label, value }) => (
            <View key={label} style={styles.summaryRow}>
              <Text
                style={[styles.summaryLabel, { color: colors.mutedForeground }]}
              >
                {label}
              </Text>
              <Text style={[styles.summaryVal, { color: colors.foreground }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleGenerate}
          disabled={generating}
          style={({ pressed }) => [
            styles.generateBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed || generating ? 0.85 : 1,
            },
          ]}
        >
          {generating ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.generateBtnText}>Generating...</Text>
            </>
          ) : (
            <>
              <Feather name="zap" size={18} color="#fff" />
              <Text style={styles.generateBtnText}>Generate Paper</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SelectorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={selectorStyles.section}>
      <Text style={[selectorStyles.title, { color: colors.foreground }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SelectorRow({
  children,
  wrap,
}: {
  children: React.ReactNode;
  wrap?: boolean;
}) {
  return (
    <View style={[selectorStyles.row, wrap && selectorStyles.wrap]}>
      {children}
    </View>
  );
}

function Pill({
  label,
  active,
  activeColor,
  activeBg,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  activeColor?: string;
  activeBg?: string;
  onPress: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        selectorStyles.pill,
        {
          backgroundColor: active
            ? activeBg || colors.primary
            : colors.secondary,
          borderColor: active ? activeColor || colors.primary : colors.border,
          borderWidth: active ? 1.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          selectorStyles.pillText,
          {
            color: active
              ? activeColor || colors.primaryForeground
              : colors.mutedForeground,
            fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const selectorStyles = StyleSheet.create({
  section: { marginBottom: 20 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  row: { flexDirection: "row", gap: 8 },
  wrap: { flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillText: { fontSize: 13 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  aiTitle: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  aiDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  countRow: { flexDirection: "row", gap: 8 },
  countBtn: {
    width: 52,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  countText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  summary: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
