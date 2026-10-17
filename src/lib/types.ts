export type UserRole = "learner" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  goal?: string;
  dailyTargetMinutes?: number;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  titleChinese: string;
  description: string;
  level: "Beginner" | "Elementary" | "Intermediate";
  pathIndex: number;
  orderIndex: number;
  isPublished: boolean;
  units?: Unit[];
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  titleChinese: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
  lessons?: Lesson[];
  quizzes?: Quiz[];
}

export interface LessonObjective {
  id: string;
  text: string;
}

export interface GrammarPoint {
  title: string;
  pattern: string;
  explanation: string;
  examples: {
    chinese: string;
    pinyin: string;
    indonesian: string;
    breakdown?: string;
  }[];
}

export interface DialogueExchange {
  speaker: string;
  chinese: string;
  pinyin: string;
  indonesian: string;
  audioKey?: string;
}

export interface LessonContent {
  objectives: string[];
  introduction: string;
  hanziFocus?: {
    character: string;
    pinyin: string;
    meaning: string;
    radical?: string;
    strokeCount?: number;
    explanation: string;
  }[];
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  dialogue?: DialogueExchange[];
  culturalNote?: string;
  summary: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  titleChinese: string;
  description: string;
  orderIndex: number;
  estimatedMinutes: number;
  content: LessonContent;
  isPublished: boolean;
}

export interface VocabularyItem {
  id: string;
  lessonId?: string;
  hanzi: string;
  pinyin: string;
  indonesian: string;
  english?: string;
  partOfSpeech: "noun" | "verb" | "adj" | "adv" | "pronoun" | "particle" | "number" | "measure_word" | "greeting" | "phrase";
  audioUrl?: string;
  exampleChinese: string;
  examplePinyin: string;
  exampleIndonesian: string;
  mnemonic?: string;
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface UserVocabulary {
  id: string;
  userId: string;
  vocabularyId: string;
  vocabulary?: VocabularyItem;
  reviewStatus: "new" | "learning" | "review" | "mastered";
  easeFactor: number; // SM-2 default 2.5
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string; // ISO date
  lastReviewedAt?: string | null;
  createdAt: string;
}

export type QuestionType =
  | "multiple_choice"
  | "match_hanzi_to_meaning"
  | "match_pinyin_to_hanzi"
  | "sentence_arrange"
  | "fill_in_the_blank"
  | "listening";

export interface QuestionOption {
  id: string;
  text: string;
  pinyin?: string;
  meaning?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  promptPinyin?: string;
  promptAudio?: string;
  options: QuestionOption[];
  correctAnswer: string | string[]; // string or array for arrange
  explanation: string;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  lessonId?: string | null;
  unitId?: string | null;
  title: string;
  description: string;
  passingScore: number; // e.g. 70
  isPublished: boolean;
  questions?: QuizQuestion[];
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  timeSpentSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  answers: Record<string, string | string[]>;
  completedAt: string;
}

export interface StudyActivity {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  minutesSpent: number;
  xpGained: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  createdAt?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  titleChinese: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: "lessons" | "quizzes" | "streak" | "vocab" | "perfect_score";
  conditionThreshold: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement?: Achievement;
}

export interface TutorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  pinyin?: string;
  translation?: string;
  createdAt: string;
}

export interface UserDashboardData {
  user: User;
  streakDays: number;
  totalXp: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  learnedVocabularyCount: number;
  dueReviewsCount: number;
  averageQuizScore: number;
  nextRecommendedLesson?: {
    courseId: string;
    lessonId: string;
    title: string;
    titleChinese: string;
    pathName: string;
  } | null;
  recentActivity: StudyActivity[];
  achievements: {
    achievement: Achievement;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
}
