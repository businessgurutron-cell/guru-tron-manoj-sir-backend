import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
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
import { QUESTION_BANK } from "@/data/questions";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, attempts, papers, students } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (profile.role === "teacher") {
    return <TeacherHome
      colors={colors}
      topPad={topPad}
      botPad={botPad}
      profile={profile}
      students={students}
      papers={papers}
    />;
  }

  return <StudentHome
    colors={colors}
    topPad={topPad}
    botPad={botPad}
    profile={profile}
    attempts={attempts}
    papers={papers}
  />;
}

function StudentHome({ colors, topPad, botPad, profile, attempts, papers }: any) {
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s: number, a: any) => s + (a.score / a.totalQuestions) * 100, 0) /
            attempts.length
        )
      : 0;

  const examColor =
    profile.targetExam === "NEET" ? "#16a34a" : profile.targetExam === "JEE" ? "#ea580c" : "#7c3aed";

  const subjectStats = ["Physics", "Chemistry", "Biology", "Mathematics"].map((subj) => {
    const sub = attempts.filter((a: any) => a.subject === subj);
    const avg = sub.length > 0
      ? Math.round(sub.reduce((s: number, a: any) => s + (a.score / a.totalQuestions) * 100, 0) / sub.length)
      : 0;
    return { subject: subj, avg, count: sub.length };
  });

  const subjectColors: Record<string, string> = {
    Physics: "#3b82f6",
    Chemistry: "#8b5cf6",
    Biology: "#22c55e",
    Mathematics: "#f59e0b",
  };

  const subjectIcons: Record<string, string> = {
    Physics: "zap",
    Chemistry: "droplet",
    Biology: "feather",
    Mathematics: "percent",
  };

  const weakTopics = attempts
    .flatMap((a: any) => a.weakTopics)
    .reduce<Record<string, number>>((acc: any, topic: string) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
  const topWeak = Object.entries(weakTopics).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 2);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero gradient header */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreet}>Good day</Text>
            <Text style={styles.heroName}>{profile.name}</Text>
          </View>
          <View style={[styles.examPill, { backgroundColor: examColor + "30", borderColor: examColor + "60" }]}>
            <View style={[styles.examDot, { backgroundColor: examColor }]} />
            <Text style={[styles.examPillText, { color: examColor === "#16a34a" ? "#4ade80" : examColor === "#ea580c" ? "#fb923c" : "#c4b5fd" }]}>
              {profile.targetExam}
            </Text>
          </View>
        </View>

        {/* Streak + points inline */}
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Feather name="activity" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.heroStatVal}>{profile.streak}</Text>
            <Text style={styles.heroStatLabel}>day streak</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Feather name="star" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.heroStatVal}>{profile.totalPoints}</Text>
            <Text style={styles.heroStatLabel}>points</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Feather name="trending-up" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.heroStatVal}>#{profile.rank}</Text>
            <Text style={styles.heroStatLabel}>rank</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Feather name="check-circle" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.heroStatVal}>{avgScore}%</Text>
            <Text style={styles.heroStatLabel}>avg score</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/(tabs)/quiz")}
            style={({ pressed }) => [styles.actionMain, { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 }]}
          >
            <Feather name="play-circle" size={22} color="#fff" />
            <Text style={styles.actionMainText}>Start Quiz</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/paper/generate")}
            style={({ pressed }) => [styles.actionSec, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="file-text" size={20} color={colors.primary} />
            <Text style={[styles.actionSecText, { color: colors.foreground }]}>Generate Paper</Text>
          </Pressable>
        </View>

        {/* Subjects */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subjects</Text>
        <View style={styles.subjectsList}>
          {["Physics", "Chemistry", "Biology", "Mathematics"].map((subj) => {
            const stat = subjectStats.find((s) => s.subject === subj)!;
            const sc = subjectColors[subj];
            const ic = subjectIcons[subj];
            return (
              <Pressable
                key={subj}
                onPress={() => router.push({ pathname: "/(tabs)/quiz", params: { subject: subj } })}
                style={({ pressed }) => [
                  styles.subjectRow,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <View style={[styles.subjectIcon, { backgroundColor: sc + "18" }]}>
                  <Feather name={ic as any} size={18} color={sc} />
                </View>
                <View style={styles.subjectInfo}>
                  <View style={styles.subjectTop}>
                    <Text style={[styles.subjectName, { color: colors.foreground }]}>{subj}</Text>
                    <Text style={[styles.subjectPct, { color: sc }]}>{stat.avg}%</Text>
                  </View>
                  <ProgressBar progress={stat.avg / 100} color={sc} height={5} />
                  <Text style={[styles.subjectCount, { color: colors.mutedForeground }]}>
                    {QUESTION_BANK.filter((q) => q.subject === subj).length} questions available
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            );
          })}
        </View>

        {/* Weak areas — only if they exist */}
        {topWeak.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Revise These</Text>
              <View style={styles.warningPill}>
                <Feather name="alert-circle" size={12} color="#f59e0b" />
                <Text style={styles.warningPillText}>Weak areas</Text>
              </View>
            </View>
            <View style={[styles.weakCard, { backgroundColor: "#fffbeb", borderColor: "#fde68a" }]}>
              {topWeak.map(([topic]) => (
                <View key={topic} style={styles.weakRow}>
                  <View style={[styles.weakDot, { backgroundColor: "#f59e0b" }]} />
                  <Text style={[styles.weakTopic, { color: "#92400e" }]}>{topic as string}</Text>
                  <Pressable
                    onPress={() => router.push("/(tabs)/quiz")}
                    style={styles.practiceBtn}
                  >
                    <Text style={styles.practiceBtnText}>Practice</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Daily Tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.tipLeft}>
            <View style={[styles.tipIcon, { backgroundColor: "#dbeafe" }]}>
              <Feather name="info" size={16} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: colors.foreground }]}>Daily Tip</Text>
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                {profile.targetExam === "NEET"
                  ? "Focus on NCERT diagrams for Biology — appear directly in NEET papers."
                  : "For JEE, practice derivations — understanding > memorising formulas."}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function TeacherHome({ colors, topPad, botPad, profile, students, papers }: any) {
  const avgClassScore =
    students.length > 0
      ? Math.round(students.reduce((s: number, st: any) => s + st.score, 0) / students.length)
      : 0;

  const topStudents = [...students].sort((a: any, b: any) => b.score - a.score).slice(0, 3);
  const needHelp = [...students].sort((a: any, b: any) => a.score - b.score).slice(0, 2);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: botPad + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Teacher hero */}
      <LinearGradient
        colors={["#1c1917", "#292524"]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.heroCircle1, { backgroundColor: "rgba(251,191,36,0.08)" }]} />
        <View style={[styles.heroCircle2, { backgroundColor: "rgba(251,191,36,0.05)" }]} />

        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreet}>Welcome back</Text>
            <Text style={styles.heroName}>{profile.name}</Text>
          </View>
          <View style={[styles.examPill, { backgroundColor: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.3)" }]}>
            <Feather name="users" size={12} color="#fbbf24" />
            <Text style={[styles.examPillText, { color: "#fbbf24" }]}>Teacher</Text>
          </View>
        </View>

        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Feather name="users" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.heroStatVal}>{students.length}</Text>
            <Text style={styles.heroStatLabel}>students</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Feather name="bar-chart-2" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.heroStatVal}>{avgClassScore}%</Text>
            <Text style={styles.heroStatLabel}>class avg</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Feather name="file-text" size={14} color="rgba(255,255,255,0.5)" />
            <Text style={styles.heroStatVal}>{papers.length}</Text>
            <Text style={styles.heroStatLabel}>papers</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Teacher actions */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => router.push("/paper/generate")}
            style={({ pressed }) => [styles.actionMain, { backgroundColor: "#d97706", opacity: pressed ? 0.88 : 1 }]}
          >
            <Feather name="file-plus" size={22} color="#fff" />
            <Text style={styles.actionMainText}>Create Test</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/papers")}
            style={({ pressed }) => [styles.actionSec, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="send" size={20} color="#d97706" />
            <Text style={[styles.actionSecText, { color: colors.foreground }]}>Assign to Class</Text>
          </Pressable>
        </View>

        {/* Class performance overview */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Class Performance</Text>
        <View style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Subject breakdown */}
          {[
            { label: "Physics", avg: 72, color: "#3b82f6" },
            { label: "Chemistry", avg: 65, color: "#8b5cf6" },
            { label: "Biology", avg: 81, color: "#22c55e" },
            { label: "Mathematics", avg: 58, color: "#f59e0b" },
          ].map(({ label, avg, color }) => (
            <View key={label} style={styles.classSubjectRow}>
              <Text style={[styles.classSubjectLabel, { color: colors.foreground }]}>{label}</Text>
              <View style={styles.classBarWrap}>
                <ProgressBar progress={avg / 100} color={color} height={6} />
              </View>
              <Text style={[styles.classSubjectPct, { color }]}>{avg}%</Text>
            </View>
          ))}
        </View>

        {/* Top students */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Performers</Text>
          <Feather name="award" size={16} color="#f59e0b" />
        </View>
        <View style={[styles.studentsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {topStudents.map((st: any, idx: number) => (
            <View
              key={st.id}
              style={[
                styles.studentRow,
                idx < topStudents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.rankBadge, {
                backgroundColor: idx === 0 ? "#fef3c7" : idx === 1 ? "#f1f5f9" : "#fef3c7",
              }]}>
                <Text style={[styles.rankBadgeText, {
                  color: idx === 0 ? "#d97706" : idx === 1 ? "#475569" : "#92400e"
                }]}>{idx + 1}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{st.name}</Text>
                <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>
                  {st.totalQuizzes} quizzes • {st.lastActive}
                </Text>
              </View>
              <View style={[styles.scoreBadge, {
                backgroundColor: st.score >= 85 ? "#dcfce7" : st.score >= 70 ? "#fef3c7" : "#fee2e2"
              }]}>
                <Text style={[styles.scoreBadgeText, {
                  color: st.score >= 85 ? "#16a34a" : st.score >= 70 ? "#d97706" : "#dc2626"
                }]}>{st.score}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Need attention */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Need Attention</Text>
          <Feather name="alert-triangle" size={16} color="#ef4444" />
        </View>
        <View style={[styles.studentsCard, { backgroundColor: "#fff5f5", borderColor: "#fecaca" }]}>
          {needHelp.map((st: any, idx: number) => (
            <View
              key={st.id}
              style={[
                styles.studentRow,
                idx < needHelp.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#fecaca" },
              ]}
            >
              <View style={[styles.alertDot, { backgroundColor: "#ef4444" }]} />
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: "#7f1d1d" }]}>{st.name}</Text>
                <Text style={{ fontSize: 12, color: "#b91c1c", fontFamily: "Inter_400Regular" }}>
                  Weak in {st.weakSubject} • {st.avgAccuracy}% accuracy
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/paper/generate")}
                style={[styles.assignBtn, { backgroundColor: "#ef4444" }]}
              >
                <Text style={styles.assignBtnText}>Assign</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* All students */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Students</Text>
        <View style={[styles.studentsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[...students].sort((a: any, b: any) => b.score - a.score).map((st: any, idx: number, arr: any[]) => (
            <View
              key={st.id}
              style={[
                styles.studentRow,
                idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.avatarSmall, { backgroundColor: colors.muted }]}>
                <Text style={[styles.avatarLetter, { color: colors.mutedForeground }]}>
                  {st.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{st.name}</Text>
                <Text style={[styles.studentMeta, { color: colors.mutedForeground }]}>
                  {st.totalQuizzes} quizzes • {st.lastActive}
                </Text>
              </View>
              <View style={styles.studentRight}>
                <Text style={[styles.studentScore, {
                  color: st.score >= 80 ? "#16a34a" : st.score >= 60 ? "#d97706" : "#ef4444"
                }]}>{st.score}%</Text>
                <Text style={[styles.weakLabel, { color: colors.mutedForeground }]}>{st.weakSubject}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  heroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -60,
    right: -40,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  heroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -30,
    left: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroGreet: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
  },
  heroName: {
    fontSize: 24,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  examPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  examDot: { width: 6, height: 6, borderRadius: 3 },
  examPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  heroStatVal: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  heroStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  actionMain: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionMainText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  actionSec: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionSecText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subjectsList: { marginBottom: 24, gap: 8 },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  subjectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectInfo: { flex: 1, gap: 6 },
  subjectTop: { flexDirection: "row", justifyContent: "space-between" },
  subjectName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  subjectPct: { fontSize: 14, fontFamily: "Inter_700Bold" },
  subjectCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  warningPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  warningPillText: {
    fontSize: 11,
    color: "#d97706",
    fontFamily: "Inter_600SemiBold",
  },
  weakCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 10,
  },
  weakRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  weakDot: { width: 8, height: 8, borderRadius: 4 },
  weakTopic: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  practiceBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  practiceBtnText: { fontSize: 12, color: "#fff", fontFamily: "Inter_600SemiBold" },
  tipCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipLeft: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  // Teacher styles
  classCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  classSubjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  classSubjectLabel: {
    width: 90,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  classBarWrap: { flex: 1 },
  classSubjectPct: {
    width: 36,
    textAlign: "right",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  studentsCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  studentMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  scoreBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  assignBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  assignBtnText: { fontSize: 12, color: "#fff", fontFamily: "Inter_600SemiBold" },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 15, fontFamily: "Inter_700Bold" },
  studentRight: { alignItems: "flex-end" },
  studentScore: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  weakLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
