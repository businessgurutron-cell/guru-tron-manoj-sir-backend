import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ExamType = "NEET" | "JEE" | "BOARD";
export type Subject = "Physics" | "Chemistry" | "Biology" | "Mathematics";
export type Difficulty = "Easy" | "Moderate" | "Hard";
export type Role = "student" | "teacher";

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
  type: "MCQ" | "Assertion-Reason" | "Case-Based";
  examType: ExamType[];
  year?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  title: string;
  subject: Subject;
  examType: ExamType;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  date: string;
  answers: Record<string, number>;
  weakTopics: string[];
}

export interface GeneratedPaper {
  id: string;
  title: string;
  examType: ExamType;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  score: number;
  totalQuizzes: number;
  avgAccuracy: number;
  weakSubject: string;
  lastActive: string;
}

export interface UserProfile {
  name: string;
  role: Role;
  targetExam: ExamType;
  streak: number;
  lastQuizDate: string;
  totalPoints: number;
  badges: Badge[];
  rank: number;
  isOnboarded: boolean;
}

interface AppContextType {
  profile: UserProfile;
  attempts: QuizAttempt[];
  papers: GeneratedPaper[];
  students: StudentRecord[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAttempt: (attempt: QuizAttempt) => void;
  addPaper: (paper: GeneratedPaper) => void;
  deletePaper: (id: string) => void;
  completeOnboarding: (name: string, role: Role, exam: ExamType) => void;
  isLoading: boolean;
}

const DEFAULT_BADGES: Badge[] = [
  { id: "topper", name: "Topper", description: "Score 90%+ in a quiz", icon: "award", earned: false },
  { id: "fast-solver", name: "Fast Solver", description: "Complete under 10 min", icon: "zap", earned: false },
  { id: "accuracy-king", name: "Accuracy King", description: "85%+ accuracy over 5 quizzes", icon: "target", earned: false },
  { id: "streak-5", name: "5-Day Streak", description: "Study 5 days in a row", icon: "activity", earned: false },
  { id: "first-paper", name: "Paper Maker", description: "Generate your first paper", icon: "file-text", earned: false },
];

const MOCK_STUDENTS: StudentRecord[] = [
  { id: "s1", name: "Priya Sharma", score: 87, totalQuizzes: 12, avgAccuracy: 82, weakSubject: "Chemistry", lastActive: "Today" },
  { id: "s2", name: "Arjun Mehta", score: 74, totalQuizzes: 8, avgAccuracy: 71, weakSubject: "Physics", lastActive: "Yesterday" },
  { id: "s3", name: "Sneha Patel", score: 91, totalQuizzes: 15, avgAccuracy: 89, weakSubject: "Organic Chemistry", lastActive: "Today" },
  { id: "s4", name: "Rahul Gupta", score: 63, totalQuizzes: 6, avgAccuracy: 60, weakSubject: "Biology", lastActive: "2 days ago" },
  { id: "s5", name: "Ananya Singh", score: 95, totalQuizzes: 20, avgAccuracy: 93, weakSubject: "Waves", lastActive: "Today" },
  { id: "s6", name: "Karan Joshi", score: 58, totalQuizzes: 4, avgAccuracy: 55, weakSubject: "Mathematics", lastActive: "3 days ago" },
];

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  role: "student",
  targetExam: "NEET",
  streak: 0,
  lastQuizDate: "",
  totalPoints: 0,
  badges: DEFAULT_BADGES,
  rank: 142,
  isOnboarded: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [papers, setPapers] = useState<GeneratedPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileStr, attemptsStr, papersStr] = await Promise.all([
        AsyncStorage.getItem("profile"),
        AsyncStorage.getItem("attempts"),
        AsyncStorage.getItem("papers"),
      ]);
      if (profileStr) setProfile(JSON.parse(profileStr));
      if (attemptsStr) setAttempts(JSON.parse(attemptsStr));
      if (papersStr) setPapers(JSON.parse(papersStr));
    } catch {}
    setIsLoading(false);
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("profile", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(
    async (name: string, role: Role, exam: ExamType) => {
      const updated: UserProfile = {
        ...DEFAULT_PROFILE,
        name,
        role,
        targetExam: exam,
        isOnboarded: true,
        badges: DEFAULT_BADGES,
      };
      setProfile(updated);
      await AsyncStorage.setItem("profile", JSON.stringify(updated));
    },
    []
  );

  const addAttempt = useCallback(async (attempt: QuizAttempt) => {
    setAttempts((prev) => {
      const updated = [attempt, ...prev];
      AsyncStorage.setItem("attempts", JSON.stringify(updated));
      return updated;
    });
    setProfile((prev) => {
      const today = new Date().toDateString();
      const streak =
        prev.lastQuizDate === new Date(Date.now() - 86400000).toDateString()
          ? prev.streak + 1
          : prev.lastQuizDate === today
            ? prev.streak
            : 1;
      const updated = {
        ...prev,
        streak,
        lastQuizDate: today,
        totalPoints: prev.totalPoints + Math.floor(attempt.score * 10),
      };
      AsyncStorage.setItem("profile", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addPaper = useCallback(async (paper: GeneratedPaper) => {
    setPapers((prev) => {
      const updated = [paper, ...prev];
      AsyncStorage.setItem("papers", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deletePaper = useCallback(async (id: string) => {
    setPapers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem("papers", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        attempts,
        papers,
        students: MOCK_STUDENTS,
        updateProfile,
        addAttempt,
        addPaper,
        deletePaper,
        completeOnboarding,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
