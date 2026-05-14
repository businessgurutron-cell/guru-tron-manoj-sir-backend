import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { attempts, profile } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalQuizzes = attempts.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          attempts.reduce(
            (sum, a) => sum + (a.score / a.totalQuestions) * 100,
            0
          ) / totalQuizzes
        )
      : 0;

  const bestScore =
    totalQuizzes > 0
      ? Math.max(...attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100)))
      : 0;

  const subjectStats = ["Physics", "Chemistry", "Biology", "Mathematics"].map(
    (subj) => {
      const subAttempts = attempts.filter((a) => a.subject === subj);
      const avg =
        subAttempts.length > 0
          ? Math.round(
              subAttempts.reduce(
                (sum, a) => sum + (a.score / a.totalQuestions) * 100,
                0
              ) / subAttempts.length
            )
          : 0;
      return { subject: subj, avg, count: subAttempts.length };
    }
  );

  const subjectColors: Record<string, string> = {
    Physics: colors.physics,
    Chemistry: colors.chemistry,
    Biology: colors.biology,
    Mathematics: colors.mathematics,
  };

  const weakTopics = attempts
    .flatMap((a) => a.weakTopics)
    .reduce<Record<string, number>>((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

  const topWeakTopics = Object.entries(weakTopics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const earnedBadges = profile.badges.filter((b) => b.earned);
  const unearnedBadges = profile.badges.filter((b) => !b.earned);

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
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        My Progress
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
        Track your performance
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Total Quizzes" value={totalQuizzes} />
        <StatCard label="Avg Score" value={`${avgScore}%`} color={colors.neet} />
        <StatCard label="Best Score" value={`${bestScore}%`} color={colors.jee} />
      </View>

      {/* Subject Breakdown */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Subject Performance
        </Text>
        {subjectStats.map(({ subject, avg, count }) => (
          <View key={subject} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={[styles.subjectName, { color: colors.foreground }]}>
                {subject}
              </Text>
              <Text
                style={[styles.subjectCount, { color: colors.mutedForeground }]}
              >
                {count} quizzes
              </Text>
            </View>
            <View style={styles.barWrapper}>
              <ProgressBar
                progress={avg / 100}
                color={subjectColors[subject]}
              />
            </View>
            <Text
              style={[styles.subjectPct, { color: subjectColors[subject] }]}
            >
              {avg}%
            </Text>
          </View>
        ))}
        {totalQuizzes === 0 && (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            Take some quizzes to see your performance
          </Text>
        )}
      </View>

      {/* Weak Topics */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Weak Areas
          </Text>
          <Feather name="alert-triangle" size={16} color={colors.warning} />
        </View>
        {topWeakTopics.length === 0 ? (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            No weak topics identified yet
          </Text>
        ) : (
          topWeakTopics.map(([topic, count]) => (
            <View key={topic} style={styles.weakRow}>
              <View
                style={[
                  styles.weakDot,
                  { backgroundColor: colors.destructive },
                ]}
              />
              <Text style={[styles.weakTopic, { color: colors.foreground }]}>
                {topic}
              </Text>
              <Text
                style={[styles.weakCount, { color: colors.mutedForeground }]}
              >
                missed {count}x
              </Text>
            </View>
          ))
        )}
        {topWeakTopics.length > 0 && (
          <View
            style={[
              styles.suggestionBox,
              { backgroundColor: colors.neetLight },
            ]}
          >
            <Feather name="book-open" size={14} color={colors.neet} />
            <Text style={[styles.suggestionText, { color: colors.neetForeground }]}>
              Focus on {topWeakTopics[0]?.[0]} — review NCERT concepts and
              attempt chapter-wise practice
            </Text>
          </View>
        )}
      </View>

      {/* Recent Attempts */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Recent Attempts
        </Text>
        {attempts.slice(0, 5).map((attempt) => {
          const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
          return (
            <View key={attempt.id} style={styles.attemptRow}>
              <View style={styles.attemptInfo}>
                <Text
                  style={[styles.attemptTitle, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {attempt.title}
                </Text>
                <Text
                  style={[
                    styles.attemptDate,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {new Date(attempt.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.scoreBadge,
                  {
                    backgroundColor:
                      pct >= 70
                        ? colors.neetLight
                        : pct >= 50
                          ? colors.jeeLight
                          : "#fee2e2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreText,
                    {
                      color:
                        pct >= 70
                          ? colors.neet
                          : pct >= 50
                            ? colors.jee
                            : colors.destructive,
                    },
                  ]}
                >
                  {pct}%
                </Text>
              </View>
            </View>
          );
        })}
        {attempts.length === 0 && (
          <Text style={[styles.noData, { color: colors.mutedForeground }]}>
            No quiz attempts yet
          </Text>
        )}
      </View>

      {/* Badges */}
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Badges & Achievements
        </Text>
        <View style={styles.badgesGrid}>
          {[...earnedBadges, ...unearnedBadges].map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badge,
                {
                  backgroundColor: badge.earned
                    ? colors.jeeLight
                    : colors.muted,
                  borderColor: badge.earned ? colors.jee : colors.border,
                },
              ]}
            >
              <Feather
                name={badge.icon as any}
                size={24}
                color={
                  badge.earned ? colors.jee : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.badgeName,
                  {
                    color: badge.earned
                      ? colors.foreground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {badge.name}
              </Text>
              {!badge.earned && (
                <View
                  style={[
                    styles.lockOverlay,
                    { backgroundColor: "rgba(0,0,0,0.05)" },
                  ]}
                >
                  <Feather name="lock" size={12} color={colors.mutedForeground} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  pageTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  subjectInfo: { width: 90 },
  subjectName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  subjectCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  barWrapper: { flex: 1 },
  subjectPct: { fontSize: 13, fontFamily: "Inter_600SemiBold", width: 36, textAlign: "right" },
  noData: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 8 },
  weakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  weakDot: { width: 8, height: 8, borderRadius: 4 },
  weakTopic: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  weakCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  suggestionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  suggestionText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  attemptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  attemptInfo: { flex: 1, marginRight: 12 },
  attemptTitle: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 2 },
  attemptDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  scoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    width: "30%",
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    position: "relative",
  },
  badgeName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  lockOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: 6,
    padding: 2,
  },
});
