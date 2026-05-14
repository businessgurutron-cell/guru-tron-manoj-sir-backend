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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ViewPaperScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { papers } = useApp();
  const [showAnswers, setShowAnswers] = useState(false);

  const paper = papers.find((p) => p.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const examColor =
    paper?.examType === "NEET"
      ? colors.neet
      : paper?.examType === "JEE"
        ? colors.jee
        : colors.board;

  if (!paper) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: topPad + 16 },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.secondary, marginLeft: 16 }]}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>
        <View style={styles.notFound}>
          <Feather name="file-x" size={40} color={colors.mutedForeground} />
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            Paper not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
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
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.headerTitle, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {paper.title}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {paper.questions.length} questions • {paper.difficulty}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowAnswers((v) => !v)}
          style={[
            styles.answerToggle,
            {
              backgroundColor: showAnswers ? colors.neetLight : colors.secondary,
              borderColor: showAnswers ? colors.neet : colors.border,
            },
          ]}
        >
          <Feather
            name={showAnswers ? "eye-off" : "eye"}
            size={15}
            color={showAnswers ? colors.neet : colors.mutedForeground}
          />
          <Text
            style={[
              styles.answerToggleText,
              { color: showAnswers ? colors.neet : colors.mutedForeground },
            ]}
          >
            {showAnswers ? "Hide" : "Answers"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
          },
        ]}
      >
        {/* Paper meta */}
        <View
          style={[
            styles.metaCard,
            { backgroundColor: examColor + "10", borderColor: examColor + "40" },
          ]}
        >
          <View style={styles.metaRow}>
            <View style={[styles.examBadge, { backgroundColor: examColor }]}>
              <Text style={styles.examBadgeText}>{paper.examType}</Text>
            </View>
            <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>
              •
            </Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {paper.subject}
            </Text>
            <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>
              •
            </Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {paper.topic === "All" ? "Mixed" : paper.topic}
            </Text>
          </View>
          <Text style={[styles.paperDate, { color: colors.mutedForeground }]}>
            Generated{" "}
            {new Date(paper.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Questions */}
        {paper.questions.map((q, idx) => (
          <View
            key={q.id}
            style={[
              styles.questionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.qHeader}>
              <View
                style={[styles.qNum, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.qNumText}>{idx + 1}</Text>
              </View>
              <View style={styles.qTags}>
                <View
                  style={[
                    styles.qTag,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text
                    style={[styles.qTagText, { color: colors.mutedForeground }]}
                  >
                    {q.topic}
                  </Text>
                </View>
                <View
                  style={[
                    styles.qTag,
                    {
                      backgroundColor:
                        q.difficulty === "Easy"
                          ? colors.neetLight
                          : q.difficulty === "Moderate"
                            ? colors.jeeLight
                            : "#fee2e2",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.qTagText,
                      {
                        color:
                          q.difficulty === "Easy"
                            ? colors.neet
                            : q.difficulty === "Moderate"
                              ? colors.jee
                              : colors.destructive,
                      },
                    ]}
                  >
                    {q.difficulty}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.qText, { color: colors.foreground }]}>
              {q.text}
            </Text>

            <View style={styles.options}>
              {q.options.map((opt, optIdx) => (
                <View
                  key={optIdx}
                  style={[
                    styles.option,
                    {
                      backgroundColor:
                        showAnswers && optIdx === q.correctIndex
                          ? colors.neetLight
                          : colors.secondary,
                      borderColor:
                        showAnswers && optIdx === q.correctIndex
                          ? colors.neet
                          : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optLetter,
                      {
                        color:
                          showAnswers && optIdx === q.correctIndex
                            ? colors.neet
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {String.fromCharCode(65 + optIdx)}.
                  </Text>
                  <Text
                    style={[
                      styles.optText,
                      {
                        color:
                          showAnswers && optIdx === q.correctIndex
                            ? colors.neetForeground
                            : colors.foreground,
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                  {showAnswers && optIdx === q.correctIndex && (
                    <Feather name="check-circle" size={16} color={colors.neet} />
                  )}
                </View>
              ))}
            </View>

            {showAnswers && (
              <View
                style={[
                  styles.explanation,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.explanationLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Explanation:
                </Text>
                <Text
                  style={[
                    styles.explanationText,
                    { color: colors.foreground },
                  ]}
                >
                  {q.explanation}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  headerTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 1,
  },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  answerToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  answerToggleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  metaCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  examBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  examBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  metaDot: { fontSize: 12 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  paperDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  questionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  qHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  qNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qNumText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  qTags: { flexDirection: "row", gap: 6 },
  qTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  qTagText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  qText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    marginBottom: 14,
  },
  options: { gap: 8, marginBottom: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  optLetter: { fontSize: 13, fontFamily: "Inter_700Bold", width: 20 },
  optText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  explanation: {
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
  },
  explanationLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
});
