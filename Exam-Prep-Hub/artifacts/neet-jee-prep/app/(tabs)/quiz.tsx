import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuizCard } from "@/components/QuizCard";
import { useColors } from "@/hooks/useColors";
import type { ExamType, Subject } from "@/context/AppContext";

const EXAM_TYPES: ExamType[] = ["NEET", "JEE", "BOARD"];
const SUBJECTS: Subject[] = ["Physics", "Chemistry", "Biology", "Mathematics"];

interface QuizDef {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  questionsCount: number;
  timeLimit: number;
  difficulty: "Easy" | "Moderate" | "Hard";
  examType: ExamType[];
  tag?: string;
  tagColor?: string;
  tagBg?: string;
}

const QUIZ_LIST: QuizDef[] = [
  {
    id: "daily",
    title: "Daily Practice Quiz",
    subject: "Physics",
    topic: "All",
    questionsCount: 10,
    timeLimit: 12,
    difficulty: "Moderate",
    examType: ["NEET", "JEE"],
    tag: "HOT",
    tagColor: "#dc2626",
    tagBg: "#fee2e2",
  },
  {
    id: "electrostatics",
    title: "Electrostatics & Capacitors",
    subject: "Physics",
    topic: "Electrostatics",
    questionsCount: 10,
    timeLimit: 15,
    difficulty: "Moderate",
    examType: ["NEET", "JEE"],
  },
  {
    id: "organicChem",
    title: "Organic Chemistry Reactions",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    questionsCount: 8,
    timeLimit: 12,
    difficulty: "Hard",
    examType: ["NEET", "JEE"],
    tag: "PYQ",
    tagColor: "#7c3aed",
    tagBg: "#ede9fe",
  },
  {
    id: "cellBiology",
    title: "Cell Biology & Organelles",
    subject: "Biology",
    topic: "Cell Biology",
    questionsCount: 10,
    timeLimit: 10,
    difficulty: "Easy",
    examType: ["NEET"],
    tag: "NEET",
    tagColor: "#16a34a",
    tagBg: "#dcfce7",
  },
  {
    id: "genetics",
    title: "Genetics & Heredity",
    subject: "Biology",
    topic: "Genetics",
    questionsCount: 12,
    timeLimit: 15,
    difficulty: "Moderate",
    examType: ["NEET"],
  },
  {
    id: "calculus",
    title: "Differential Calculus",
    subject: "Mathematics",
    topic: "Calculus",
    questionsCount: 10,
    timeLimit: 20,
    difficulty: "Hard",
    examType: ["JEE"],
    tag: "JEE",
    tagColor: "#ea580c",
    tagBg: "#ffedd5",
  },
  {
    id: "thermodynamics",
    title: "Thermodynamics",
    subject: "Physics",
    topic: "Thermodynamics",
    questionsCount: 10,
    timeLimit: 15,
    difficulty: "Moderate",
    examType: ["NEET", "JEE"],
  },
  {
    id: "chemKinetics",
    title: "Chemical Kinetics & Equilibrium",
    subject: "Chemistry",
    topic: "Chemical Kinetics",
    questionsCount: 10,
    timeLimit: 14,
    difficulty: "Hard",
    examType: ["JEE"],
    tag: "PYQ",
    tagColor: "#7c3aed",
    tagBg: "#ede9fe",
  },
  {
    id: "humanPhysio",
    title: "Human Physiology",
    subject: "Biology",
    topic: "Human Physiology",
    questionsCount: 15,
    timeLimit: 18,
    difficulty: "Moderate",
    examType: ["NEET"],
    tag: "NEET",
    tagColor: "#16a34a",
    tagBg: "#dcfce7",
  },
];

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ subject?: string }>();
  const [selectedExam, setSelectedExam] = useState<ExamType | "All">("All");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "All">(
    (params.subject as Subject) || "All"
  );

  const filtered = QUIZ_LIST.filter((q) => {
    const examMatch =
      selectedExam === "All" || q.examType.includes(selectedExam);
    const subjectMatch =
      selectedSubject === "All" || q.subject === selectedSubject;
    return examMatch && subjectMatch;
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Quiz Mode</Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
        Practice with timed tests
      </Text>

      {/* Exam filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {(["All", ...EXAM_TYPES] as const).map((exam) => (
          <Pressable
            key={exam}
            onPress={() => setSelectedExam(exam as ExamType | "All")}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedExam === exam ? colors.primary : colors.card,
                borderColor:
                  selectedExam === exam ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedExam === exam
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                },
              ]}
            >
              {exam}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Subject filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {(["All", ...SUBJECTS] as const).map((sub) => (
          <Pressable
            key={sub}
            onPress={() => setSelectedSubject(sub as Subject | "All")}
            style={[
              styles.chip,
              {
                backgroundColor:
                  selectedSubject === sub ? colors.secondary : colors.card,
                borderColor:
                  selectedSubject === sub
                    ? colors.mutedForeground
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color:
                    selectedSubject === sub
                      ? colors.foreground
                      : colors.mutedForeground,
                  fontFamily:
                    selectedSubject === sub
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                },
              ]}
            >
              {sub}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results */}
      <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
        {filtered.length} quizzes
      </Text>

      {filtered.map((quiz) => (
        <QuizCard
          key={quiz.id}
          title={quiz.title}
          subject={quiz.subject}
          questionsCount={quiz.questionsCount}
          timeLimit={quiz.timeLimit}
          difficulty={quiz.difficulty}
          tag={quiz.tag}
          tagColor={quiz.tagColor}
          tagBg={quiz.tagBg}
          onPress={() =>
            router.push({
              pathname: "/quiz/[id]",
              params: {
                id: quiz.id,
                title: quiz.title,
                subject: quiz.subject,
                topic: quiz.topic,
                difficulty: quiz.difficulty,
                examType: quiz.examType[0],
                timeLimit: String(quiz.timeLimit),
                questionsCount: String(quiz.questionsCount),
              },
            })
          }
        />
      ))}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Feather name="inbox" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No quizzes match your filters
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  filterScroll: { marginBottom: 8 },
  filterRow: { flexDirection: "row", gap: 8, paddingRight: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  resultCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
    marginTop: 4,
  },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
