import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function PapersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { papers, deletePaper } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Paper", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePaper(id),
      },
    ]);
  };

  const diffColor = (diff: string) =>
    diff === "Easy"
      ? colors.neet
      : diff === "Moderate"
        ? colors.jee
        : colors.destructive;

  const examColor = (exam: string) =>
    exam === "NEET" ? colors.neet : exam === "JEE" ? colors.jee : colors.board;
  const examBg = (exam: string) =>
    exam === "NEET"
      ? colors.neetLight
      : exam === "JEE"
        ? colors.jeeLight
        : colors.boardLight;

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
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            My Papers
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
            {papers.length} generated
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/paper/generate")}
          style={({ pressed }) => [
            styles.generateBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.generateBtnText}>New Paper</Text>
        </Pressable>
      </View>

      {papers.length === 0 && (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.muted },
            ]}
          >
            <Feather name="file-text" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No papers yet
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Generate your first practice paper using the AI Paper Generator
          </Text>
          <Pressable
            onPress={() => router.push("/paper/generate")}
            style={({ pressed }) => [
              styles.emptyBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.emptyBtnText}>Generate Paper</Text>
          </Pressable>
        </View>
      )}

      {papers.map((paper) => (
        <View
          key={paper.id}
          style={[
            styles.paperCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.paperHeader}>
            <View style={[styles.examTag, { backgroundColor: examBg(paper.examType) }]}>
              <Text
                style={[styles.examTagText, { color: examColor(paper.examType) }]}
              >
                {paper.examType}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(paper.id, paper.title)}
              style={styles.deleteBtn}
            >
              <Feather name="trash-2" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.paperTitle, { color: colors.foreground }]}>
            {paper.title}
          </Text>
          <Text style={[styles.paperTopic, { color: colors.mutedForeground }]}>
            {paper.subject} • {paper.topic}
          </Text>
          <View style={styles.paperMeta}>
            <View style={styles.metaItem}>
              <Feather name="help-circle" size={13} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {paper.questions.length} questions
              </Text>
            </View>
            <View
              style={[
                styles.diffBadge,
                { backgroundColor: diffColor(paper.difficulty) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  { color: diffColor(paper.difficulty) },
                ]}
              >
                {paper.difficulty}
              </Text>
            </View>
          </View>
          <Text style={[styles.paperDate, { color: colors.mutedForeground }]}>
            {new Date(paper.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/paper/[id]",
                params: { id: paper.id },
              })
            }
            style={({ pressed }) => [
              styles.viewBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.secondary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.viewBtnText, { color: colors.foreground }]}>
              View Paper
            </Text>
            <Feather name="arrow-right" size={14} color={colors.foreground} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    padding: 32,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  paperCard: {
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
  paperHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  examTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examTagText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  deleteBtn: { padding: 4 },
  paperTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  paperTopic: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  paperMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  paperDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 12 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
