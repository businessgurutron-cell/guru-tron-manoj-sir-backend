import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressBar } from "@/components/ProgressBar";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { getQuestions } from "@/data/questions";
import type { ExamType, Subject } from "@/context/AppContext";

type Phase = "intro" | "quiz" | "result";

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    subject: string;
    topic: string;
    difficulty: string;
    examType: string;
    timeLimit: string;
    questionsCount: string;
  }>();
  const { addAttempt } = useApp();

  const timeLimit = parseInt(params.timeLimit || "15") * 60;
  const questionsCount = parseInt(params.questionsCount || "10");

  const questions = getQuestions(
    params.subject || "All",
    params.topic || "All",
    params.difficulty || "All",
    params.examType || "All",
    questionsCount
  );

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const finishQuiz = useCallback(
    (timedOut = false) => {
      if (timerRef.current) clearInterval(timerRef.current);
      const score = questions.reduce(
        (sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0),
        0
      );
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const wrongQs = questions.filter((q) => answers[q.id] !== q.correctIndex);
      const weakTopics = [...new Set(wrongQs.map((q) => q.topic))];

      addAttempt({
        id: Date.now().toString(),
        quizId: params.id,
        title: params.title,
        subject: params.subject as Subject,
        examType: params.examType as ExamType,
        score,
        totalQuestions: questions.length,
        timeSpent,
        date: new Date().toISOString(),
        answers,
        weakTopics,
      });

      if (timedOut) {
        Alert.alert("Time's up!", "Quiz submitted automatically.", [
          { text: "OK" },
        ]);
      }

      setPhase("result");
    },
    [answers, questions, startTime, params, addAttempt]
  );

  useEffect(() => {
    if (phase === "quiz") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            finishQuiz(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, finishQuiz]);

  const startQuiz = () => {
    setPhase("quiz");
    setStartTime(Date.now());
  };

  const handleAnswer = (optionIndex: number) => {
    const q = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    if (optionIndex === q.correctIndex) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (phase === "intro") {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 16,
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.introContent}
        >
          <View
            style={[
              styles.introBanner,
              { backgroundColor: colors.primary },
            ]}
          >
            <Feather name="play-circle" size={48} color="#fff" />
            <Text style={styles.introTitle}>{params.title}</Text>
            <Text style={styles.introSubject}>{params.subject}</Text>
          </View>

          <View style={styles.infoGrid}>
            {[
              { icon: "help-circle", label: "Questions", value: `${questions.length}` },
              {
                icon: "clock",
                label: "Time Limit",
                value: `${params.timeLimit} min`,
              },
              { icon: "bar-chart", label: "Difficulty", value: params.difficulty },
              { icon: "target", label: "Exam", value: params.examType },
            ].map(({ icon, label, value }) => (
              <View
                key={label}
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather
                  name={icon as any}
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[styles.infoVal, { color: colors.foreground }]}
                >
                  {value}
                </Text>
                <Text
                  style={[styles.infoLabel, { color: colors.mutedForeground }]}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.ruleCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.ruleTitle, { color: colors.foreground }]}>
              Instructions
            </Text>
            {[
              "Each question has one correct answer",
              "Explanation shown after each answer",
              "Timer runs throughout the quiz",
              "Results and weak areas shown at the end",
            ].map((rule) => (
              <View key={rule} style={styles.ruleRow}>
                <Feather name="check" size={14} color={colors.neet} />
                <Text
                  style={[styles.ruleText, { color: colors.mutedForeground }]}
                >
                  {rule}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={startQuiz}
            style={({ pressed }) => [
              styles.startBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Feather name="play" size={18} color="#fff" />
            <Text style={styles.startBtnText}>Start Quiz</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (phase === "quiz") {
    const q = questions[currentIndex];
    const selectedAnswer = answers[q.id];
    const hasAnswered = selectedAnswer !== undefined;
    const timerPct = timeLeft / timeLimit;
    const timerColor =
      timerPct > 0.5
        ? colors.neet
        : timerPct > 0.2
          ? colors.warning
          : colors.destructive;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 8,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.quizHeader, { paddingHorizontal: 16 }]}>
          <Pressable
            onPress={() => {
              Alert.alert("Quit Quiz?", "Progress will be lost.", [
                { text: "Continue", style: "cancel" },
                {
                  text: "Quit",
                  style: "destructive",
                  onPress: () => {
                    if (timerRef.current) clearInterval(timerRef.current);
                    router.back();
                  },
                },
              ]);
            }}
            style={[styles.quitBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
          <View style={styles.quizProgress}>
            <Text style={[styles.qProgress, { color: colors.mutedForeground }]}>
              {currentIndex + 1} / {questions.length}
            </Text>
            <ProgressBar
              progress={(currentIndex + 1) / questions.length}
              height={6}
            />
          </View>
          <View
            style={[
              styles.timer,
              { backgroundColor: timerColor + "20" },
            ]}
          >
            <Feather name="clock" size={13} color={timerColor} />
            <Text style={[styles.timerText, { color: timerColor }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.quizScroll}
          contentContainerStyle={[
            styles.quizContent,
            {
              paddingBottom:
                Platform.OS === "web" ? 34 : insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Tags */}
          <View style={styles.tagsRow}>
            <View
              style={[
                styles.tagChip,
                { backgroundColor: colors.physics + "20" },
              ]}
            >
              <Text
                style={[styles.tagChipText, { color: colors.physics }]}
              >
                {q.subject}
              </Text>
            </View>
            <View
              style={[
                styles.tagChip,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={[
                  styles.tagChipText,
                  { color: colors.mutedForeground },
                ]}
              >
                {q.topic}
              </Text>
            </View>
            {q.year && (
              <View
                style={[
                  styles.tagChip,
                  { backgroundColor: colors.jeeLight },
                ]}
              >
                <Text
                  style={[styles.tagChipText, { color: colors.jee }]}
                >
                  PYQ {q.year}
                </Text>
              </View>
            )}
          </View>

          {/* Question */}
          <Text style={[styles.questionText, { color: colors.foreground }]}>
            {q.text}
          </Text>

          {/* Options */}
          <View style={styles.options}>
            {q.options.map((option, idx) => {
              let bgColor = colors.card;
              let borderColor = colors.border;
              let textColor = colors.foreground;

              if (hasAnswered) {
                if (idx === q.correctIndex) {
                  bgColor = colors.neetLight;
                  borderColor = colors.neet;
                  textColor = colors.neetForeground;
                } else if (idx === selectedAnswer) {
                  bgColor = "#fee2e2";
                  borderColor = colors.destructive;
                  textColor = colors.destructive;
                }
              }

              return (
                <Pressable
                  key={idx}
                  onPress={() => !hasAnswered && handleAnswer(idx)}
                  disabled={hasAnswered}
                  style={[
                    styles.option,
                    { backgroundColor: bgColor, borderColor, borderWidth: 1.5 },
                  ]}
                >
                  <View
                    style={[
                      styles.optionLetter,
                      {
                        backgroundColor: hasAnswered
                          ? idx === q.correctIndex
                            ? colors.neet
                            : idx === selectedAnswer
                              ? colors.destructive
                              : colors.muted
                          : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLetterText,
                        {
                          color:
                            hasAnswered &&
                            (idx === q.correctIndex || idx === selectedAnswer)
                              ? "#fff"
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.optionText, { color: textColor }]}
                  >
                    {option}
                  </Text>
                  {hasAnswered && idx === q.correctIndex && (
                    <Feather name="check-circle" size={18} color={colors.neet} />
                  )}
                  {hasAnswered &&
                    idx === selectedAnswer &&
                    idx !== q.correctIndex && (
                      <Feather name="x-circle" size={18} color={colors.destructive} />
                    )}
                </Pressable>
              );
            })}
          </View>

          {/* Explanation */}
          {showExplanation && (
            <View
              style={[
                styles.explanation,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.explanationHeader}>
                <Feather name="info" size={15} color={colors.info} />
                <Text
                  style={[styles.explanationTitle, { color: colors.foreground }]}
                >
                  Explanation
                </Text>
              </View>
              <Text
                style={[
                  styles.explanationText,
                  { color: colors.mutedForeground },
                ]}
              >
                {q.explanation}
              </Text>
            </View>
          )}

          {hasAnswered && (
            <Pressable
              onPress={nextQuestion}
              style={({ pressed }) => [
                styles.nextBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  // Result phase
  const score = questions.reduce(
    (sum, q) => sum + (answers[q.id] === q.correctIndex ? 1 : 0),
    0
  );
  const pct = Math.round((score / questions.length) * 100);
  const resultColor =
    pct >= 70 ? colors.neet : pct >= 50 ? colors.warning : colors.destructive;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.resultContent, { paddingHorizontal: 16 }]}
      >
        {/* Score circle */}
        <View style={[styles.scoreCircle, { borderColor: resultColor }]}>
          <Text style={[styles.scoreNumber, { color: resultColor }]}>{pct}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            {score}/{questions.length}
          </Text>
        </View>

        <Text style={[styles.resultTitle, { color: colors.foreground }]}>
          {pct >= 80
            ? "Excellent work!"
            : pct >= 60
              ? "Good effort!"
              : "Keep practicing!"}
        </Text>
        <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]}>
          {pct >= 80
            ? "You have a strong grasp of this topic."
            : pct >= 60
              ? "Review the explanations to improve further."
              : "Focus on your weak areas and retry."}
        </Text>

        {/* Stats */}
        <View style={styles.resultStats}>
          <View
            style={[
              styles.resultStat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.resultStatVal, { color: colors.neet }]}>
              {score}
            </Text>
            <Text
              style={[
                styles.resultStatLabel,
                { color: colors.mutedForeground },
              ]}
            >
              Correct
            </Text>
          </View>
          <View
            style={[
              styles.resultStat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.resultStatVal,
                { color: colors.destructive },
              ]}
            >
              {questions.length - score}
            </Text>
            <Text
              style={[
                styles.resultStatLabel,
                { color: colors.mutedForeground },
              ]}
            >
              Wrong
            </Text>
          </View>
          <View
            style={[
              styles.resultStat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.resultStatVal, { color: colors.jee }]}>
              {questions.filter((q) => answers[q.id] === undefined).length}
            </Text>
            <Text
              style={[
                styles.resultStatLabel,
                { color: colors.mutedForeground },
              ]}
            >
              Skipped
            </Text>
          </View>
        </View>

        <View style={styles.resultActions}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.retryBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={16} color={colors.foreground} />
            <Text style={[styles.retryBtnText, { color: colors.foreground }]}>
              Back to Quiz
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setPhase("intro");
              setCurrentIndex(0);
              setAnswers({});
              setShowExplanation(false);
              setTimeLeft(timeLimit);
            }}
            style={({ pressed }) => [
              styles.doneBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.doneBtnText}>Try Again</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
    marginBottom: 16,
  },
  introContent: { paddingHorizontal: 16, paddingBottom: 32 },
  introBanner: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  introTitle: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  introSubject: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  infoCard: {
    width: "47%",
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  infoVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  ruleCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  ruleTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  ruleText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
  },
  quitBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quizProgress: { flex: 1, gap: 4 },
  qProgress: { fontSize: 12, fontFamily: "Inter_400Regular" },
  timer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  quizScroll: { flex: 1 },
  quizContent: { paddingHorizontal: 16, paddingTop: 8 },
  tagsRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagChipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  questionText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 26,
    marginBottom: 20,
  },
  options: { gap: 10, marginBottom: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  explanation: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  explanationText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  resultContent: { alignItems: "center", paddingTop: 20 },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  scoreNumber: { fontSize: 36, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resultStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    width: "100%",
  },
  resultStat: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  resultStatVal: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  resultStatLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  retryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  doneBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
