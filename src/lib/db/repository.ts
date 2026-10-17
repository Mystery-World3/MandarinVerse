import fs from "fs";
import path from "path";
import {
  Achievement,
  Course,
  Lesson,
  LessonProgress,
  Quiz,
  QuizAttempt,
  ReviewGrade,
  StudyActivity,
  User,
  UserAchievement,
  UserDashboardData,
  UserVocabulary,
  VocabularyItem,
} from "../types";
import { INITIAL_ACHIEVEMENTS, INITIAL_COURSES } from "../curriculum/courses-data";
import { calculateNextReview, isDueForReview } from "../srs";
import { isPostgresConfigured, query } from "./index";

// Path for local mock file persistence when DATABASE_URL is not set
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface LocalStore {
  courses: Course[];
  achievements: Achievement[];
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  userVocabulary: UserVocabulary[];
  studyActivities: StudyActivity[];
  userAchievements: UserAchievement[];
  users: User[];
}

function getInitialStore(): LocalStore {
  return {
    courses: INITIAL_COURSES,
    achievements: INITIAL_ACHIEVEMENTS,
    lessonProgress: [],
    quizAttempts: [],
    userVocabulary: [],
    studyActivities: [],
    userAchievements: [],
    users: [
      {
        id: "demo-user-1",
        name: "Pembelajar Mandiri",
        email: "demo@mandarinverse.com",
        emailVerified: true,
        role: "learner",
        goal: "Kemampuan berbicara sehari-hari dan karir",
        dailyTargetMinutes: 15,
        level: "Beginner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "admin-user-1",
        name: "Admin MandarinVerse",
        email: "admin@mandarinverse.com",
        emailVerified: true,
        role: "admin",
        goal: "Manajemen kurikulum",
        dailyTargetMinutes: 20,
        level: "Intermediate",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}

let memoryStore: LocalStore | null = null;

function getLocalStore(): LocalStore {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      memoryStore = JSON.parse(raw);
      return memoryStore!;
    }
  } catch (err) {
    console.warn("Could not read local store file, initializing new store.");
  }

  memoryStore = getInitialStore();
  saveLocalStore(memoryStore);
  return memoryStore;
}

function saveLocalStore(store: LocalStore) {
  memoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    // Non-fatal if writing to file is restricted in serverless environment
  }
}

// ==========================================
// COURSES & LESSONS
// ==========================================

export async function getCourses(): Promise<Course[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query<any>(
        `SELECT id, slug, title, title_chinese as "titleChinese", description, level, path_index as "pathIndex", order_index as "orderIndex", is_published as "isPublished" 
         FROM courses WHERE is_published = true ORDER BY path_index ASC, order_index ASC`
      );
      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (e) {
      console.error("Postgres getCourses error, falling back to local dataset:", e);
    }
  }
  return getLocalStore().courses.filter((c) => c.isPublished);
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const courses = await getCourses();
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  return course || null;
}

export async function getLessonById(lessonId: string): Promise<{ lesson: Lesson; course: Course } | null> {
  const courses = getLocalStore().courses;
  for (const course of courses) {
    for (const unit of course.units || []) {
      for (const lesson of unit.lessons || []) {
        if (lesson.id === lessonId) {
          return { lesson, course };
        }
      }
    }
  }
  return null;
}

export async function getQuizById(quizId: string): Promise<{ quiz: Quiz; course?: Course } | null> {
  const courses = getLocalStore().courses;
  for (const course of courses) {
    for (const unit of course.units || []) {
      for (const quiz of unit.quizzes || []) {
        if (quiz.id === quizId) {
          return { quiz, course };
        }
      }
    }
  }
  return null;
}

// ==========================================
// PROGRESS & COMPLETION
// ==========================================

export async function getUserLessonProgress(userId: string): Promise<LessonProgress[]> {
  if (isPostgresConfigured()) {
    try {
      const rows = await query<any>(
        `SELECT id, user_id as "userId", lesson_id as "lessonId", is_completed as "isCompleted", completed_at as "completedAt", score, time_spent_seconds as "timeSpentSeconds"
         FROM lesson_progress WHERE user_id = $1`,
        [userId]
      );
      return rows;
    } catch (e) {
      console.error("Postgres getUserLessonProgress error:", e);
    }
  }
  const store = getLocalStore();
  return store.lessonProgress.filter((p) => p.userId === userId);
}

export async function completeLesson(
  userId: string,
  lessonId: string,
  timeSpentSeconds: number = 300
): Promise<{ success: boolean; isFirstCompletion: boolean; xpGained: number }> {
  const store = getLocalStore();
  const existingIdx = store.lessonProgress.findIndex(
    (p) => p.userId === userId && p.lessonId === lessonId
  );

  let isFirstCompletion = false;
  const now = new Date().toISOString();
  const xpGained = 50;

  if (existingIdx >= 0) {
    store.lessonProgress[existingIdx].isCompleted = true;
    store.lessonProgress[existingIdx].completedAt = now;
    store.lessonProgress[existingIdx].timeSpentSeconds += timeSpentSeconds;
  } else {
    isFirstCompletion = true;
    store.lessonProgress.push({
      id: `lp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      lessonId,
      isCompleted: true,
      completedAt: now,
      score: 100,
      timeSpentSeconds,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Record study activity
  recordActivity(userId, Math.round(timeSpentSeconds / 60), xpGained, 1, 0);

  // Auto-save vocabulary from this lesson into user's SRS deck
  const lessonData = await getLessonById(lessonId);
  if (lessonData?.lesson.content.vocabulary) {
    for (const vocab of lessonData.lesson.content.vocabulary) {
      saveUserVocabulary(userId, vocab);
    }
  }

  // Check achievements
  await checkAndAwardAchievements(userId);

  saveLocalStore(store);

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO lesson_progress (id, user_id, lesson_id, is_completed, completed_at, score, time_spent_seconds, updated_at)
         VALUES ($1, $2, $3, true, $4, 100, $5, $4)
         ON CONFLICT (user_id, lesson_id) DO UPDATE SET
           is_completed = true,
           completed_at = $4,
           time_spent_seconds = lesson_progress.time_spent_seconds + $5,
           updated_at = $4`,
        [`lp-${Date.now()}`, userId, lessonId, now, timeSpentSeconds]
      );
    } catch (e) {
      console.error("Postgres completeLesson error:", e);
    }
  }

  return { success: true, isFirstCompletion, xpGained };
}

// ==========================================
// QUIZZES & EVALUATION
// ==========================================

export async function submitQuizAnswers(
  userId: string,
  quizId: string,
  userAnswers: Record<string, string | string[]>
): Promise<{
  attempt: QuizAttempt;
  questionResults: {
    questionId: string;
    isCorrect: boolean;
    userAnswer: any;
    correctAnswer: any;
    explanation: string;
  }[];
}> {
  const quizData = await getQuizById(quizId);
  const questions = quizData?.quiz.questions || [];
  if (!quizData || questions.length === 0) {
    throw new Error("Kuis tidak ditemukan");
  }

  const { quiz } = quizData;
  let correctCount = 0;
  const questionResults = [];

  for (const q of questions) {
    const userAns = userAnswers[q.id];
    let isCorrect = false;

    if (Array.isArray(q.correctAnswer)) {
      // Sentence rearrange or multi-item
      if (Array.isArray(userAns)) {
        isCorrect =
          q.correctAnswer.length === userAns.length &&
          q.correctAnswer.every((val, idx) => val === userAns[idx]);
      }
    } else {
      isCorrect = String(userAns || "").trim() === String(q.correctAnswer || "").trim();
    }

    if (isCorrect) correctCount += 1;

    questionResults.push({
      questionId: q.id,
      isCorrect,
      userAnswer: userAns,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    });
  }

  const maxScore = questions.length;
  const percentage = Math.round((correctCount / maxScore) * 100);
  const isPassed = percentage >= quiz.passingScore;
  const xpGained = isPassed ? 75 : 25;

  const attempt: QuizAttempt = {
    id: `qa-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    quizId,
    score: correctCount,
    maxScore,
    percentage,
    isPassed,
    answers: userAnswers,
    completedAt: new Date().toISOString(),
  };

  const store = getLocalStore();
  store.quizAttempts.push(attempt);
  recordActivity(userId, 10, xpGained, 0, 1);
  await checkAndAwardAchievements(userId);
  saveLocalStore(store);

  if (isPostgresConfigured()) {
    try {
      await query(
        `INSERT INTO quiz_attempts (id, user_id, quiz_id, score, max_score, percentage, is_passed, answers_json, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          attempt.id,
          userId,
          quizId,
          attempt.score,
          attempt.maxScore,
          attempt.percentage,
          attempt.isPassed,
          JSON.stringify(userAnswers),
          attempt.completedAt,
        ]
      );
    } catch (e) {
      console.error("Postgres submitQuizAnswers error:", e);
    }
  }

  return { attempt, questionResults };
}

// ==========================================
// VOCABULARY & SPACED REPETITION (SRS)
// ==========================================

export function saveUserVocabulary(userId: string, vocab: VocabularyItem): UserVocabulary {
  const store = getLocalStore();
  const existing = store.userVocabulary.find(
    (uv) => uv.userId === userId && uv.vocabularyId === vocab.id
  );

  if (existing) return existing;

  const now = new Date();
  const item: UserVocabulary = {
    id: `uv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    vocabularyId: vocab.id,
    vocabulary: vocab,
    reviewStatus: "new",
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewDate: now.toISOString(),
    lastReviewedAt: null,
    createdAt: now.toISOString(),
  };

  store.userVocabulary.push(item);
  saveLocalStore(store);
  return item;
}

export async function getUserVocabulary(userId: string): Promise<UserVocabulary[]> {
  const store = getLocalStore();
  // Ensure vocabulary object is attached
  const userVocabs = store.userVocabulary.filter((uv) => uv.userId === userId);
  return userVocabs;
}

export async function reviewUserVocabulary(
  userId: string,
  vocabularyId: string,
  grade: ReviewGrade
): Promise<UserVocabulary> {
  const store = getLocalStore();
  let item = store.userVocabulary.find(
    (uv) => uv.userId === userId && uv.vocabularyId === vocabularyId
  );

  if (!item) {
    // Look up vocab in courses
    let foundVocab: VocabularyItem | undefined;
    for (const c of store.courses) {
      for (const u of c.units || []) {
        for (const l of u.lessons || []) {
          const v = l.content.vocabulary.find((x) => x.id === vocabularyId);
          if (v) {
            foundVocab = v;
            break;
          }
        }
      }
    }

    if (!foundVocab) throw new Error("Kosakata tidak ditemukan");
    item = saveUserVocabulary(userId, foundVocab);
  }

  const nextSchedule = calculateNextReview({
    repetitions: item.repetitions,
    easeFactor: item.easeFactor,
    intervalDays: item.intervalDays,
    grade,
  });

  item.repetitions = nextSchedule.repetitions;
  item.easeFactor = nextSchedule.easeFactor;
  item.intervalDays = nextSchedule.intervalDays;
  item.nextReviewDate = nextSchedule.nextReviewDate;
  item.reviewStatus = nextSchedule.status;
  item.lastReviewedAt = new Date().toISOString();

  recordActivity(userId, 2, 10, 0, 0);
  await checkAndAwardAchievements(userId);
  saveLocalStore(store);

  return item;
}

// ==========================================
// STUDY ACTIVITY & DASHBOARD
// ==========================================

export function recordActivity(
  userId: string,
  minutesSpent: number,
  xpGained: number,
  lessonsCompleted: number,
  quizzesTaken: number
) {
  const store = getLocalStore();
  const today = new Date().toISOString().split("T")[0];
  const existing = store.studyActivities.find((a) => a.userId === userId && a.date === today);

  if (existing) {
    existing.minutesSpent += minutesSpent;
    existing.xpGained += xpGained;
    existing.lessonsCompleted += lessonsCompleted;
    existing.quizzesTaken += quizzesTaken;
  } else {
    store.studyActivities.push({
      id: `act-${Date.now()}`,
      userId,
      date: today,
      minutesSpent,
      xpGained,
      lessonsCompleted,
      quizzesTaken,
      createdAt: new Date().toISOString(),
    });
  }
}

export async function getUserDashboardData(userId: string): Promise<UserDashboardData> {
  const store = getLocalStore();
  const user = store.users.find((u) => u.id === userId) || {
    id: userId,
    name: "Pembelajar Mandarin",
    email: "learner@mandarinverse.com",
    emailVerified: true,
    role: "learner",
    goal: "Percakapan Harian",
    dailyTargetMinutes: 10,
    level: "Beginner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const progressList = store.lessonProgress.filter((p) => p.userId === userId && p.isCompleted);
  const quizAttempts = store.quizAttempts.filter((q) => q.userId === userId);
  const userVocab = store.userVocabulary.filter((v) => v.userId === userId);
  const activities = store.studyActivities
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Calculate genuine streak days
  let streakDays = 0;
  if (activities.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mostRecentDate = new Date(activities[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 1) {
      streakDays = 1;
      const checkDate = new Date(mostRecentDate);
      for (let i = 1; i < activities.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = checkDate.toISOString().split("T")[0];
        if (activities[i].date === checkStr) {
          streakDays += 1;
        } else {
          break;
        }
      }
    }
  }

  // Calculate total XP
  const totalXp = activities.reduce((acc, curr) => acc + curr.xpGained, 0);

  // Calculate total lessons in curriculum
  let totalLessonsCount = 0;
  for (const c of store.courses) {
    for (const u of c.units || []) {
      totalLessonsCount += (u.lessons || []).length;
    }
  }

  // Calculate due reviews
  const dueReviewsCount = userVocab.filter((v) => isDueForReview(v.nextReviewDate)).length;

  // Calculate average quiz score
  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / quizAttempts.length
        )
      : 0;

  // Next recommended lesson
  let nextLesson = null;
  const completedLessonIds = new Set(progressList.map((p) => p.lessonId));

  for (const c of store.courses) {
    for (const u of c.units || []) {
      for (const l of u.lessons || []) {
        if (!completedLessonIds.has(l.id)) {
          nextLesson = {
            courseId: c.id,
            lessonId: l.id,
            title: l.title,
            titleChinese: l.titleChinese,
            pathName: c.title,
          };
          break;
        }
      }
      if (nextLesson) break;
    }
    if (nextLesson) break;
  }

  // Achievements
  const userUnlocked = new Set(
    store.userAchievements.filter((ua) => ua.userId === userId).map((ua) => ua.achievementId)
  );

  const achievements = store.achievements.map((ach) => ({
    achievement: ach,
    unlocked: userUnlocked.has(ach.id),
  }));

  return {
    user,
    streakDays,
    totalXp,
    completedLessonsCount: progressList.length,
    totalLessonsCount,
    learnedVocabularyCount: userVocab.length,
    dueReviewsCount,
    averageQuizScore: avgQuizScore,
    nextRecommendedLesson: nextLesson,
    recentActivity: activities.slice(0, 7),
    achievements,
  };
}

async function checkAndAwardAchievements(userId: string) {
  const store = getLocalStore();
  const completedLessons = store.lessonProgress.filter(
    (p) => p.userId === userId && p.isCompleted
  ).length;
  const passedQuizzes = store.quizAttempts.filter(
    (q) => q.userId === userId && q.isPassed
  ).length;
  const learnedVocab = store.userVocabulary.filter((v) => v.userId === userId).length;

  for (const ach of store.achievements) {
    const alreadyUnlocked = store.userAchievements.some(
      (ua) => ua.userId === userId && ua.achievementId === ach.id
    );
    if (alreadyUnlocked) continue;

    let shouldUnlock = false;
    if (ach.conditionType === "lessons" && completedLessons >= ach.conditionThreshold) {
      shouldUnlock = true;
    } else if (ach.conditionType === "quizzes" && passedQuizzes >= ach.conditionThreshold) {
      shouldUnlock = true;
    } else if (ach.conditionType === "vocab" && learnedVocab >= ach.conditionThreshold) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      store.userAchievements.push({
        id: `ua-${Date.now()}-${ach.id}`,
        userId,
        achievementId: ach.id,
        unlockedAt: new Date().toISOString(),
      });
      recordActivity(userId, 0, ach.xpReward, 0, 0);
    }
  }
}

// ==========================================
// ADMIN ACTIONS
// ==========================================

export async function adminSaveCourse(course: Course): Promise<Course> {
  const store = getLocalStore();
  const idx = store.courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) {
    store.courses[idx] = course;
  } else {
    store.courses.push(course);
  }
  saveLocalStore(store);
  return course;
}

export async function adminExportAll(): Promise<string> {
  const store = getLocalStore();
  return JSON.stringify(
    {
      courses: store.courses,
      achievements: store.achievements,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    },
    null,
    2
  );
}

export async function adminImportCourses(jsonString: string): Promise<{ success: boolean; count: number }> {
  const parsed = JSON.parse(jsonString);
  if (!parsed.courses || !Array.isArray(parsed.courses)) {
    throw new Error("Format JSON tidak valid: properti 'courses' harus berupa array");
  }
  const store = getLocalStore();
  store.courses = parsed.courses;
  saveLocalStore(store);
  return { success: true, count: parsed.courses.length };
}

export async function makeUserAdmin(email: string): Promise<boolean> {
  const store = getLocalStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.role = "admin";
  saveLocalStore(store);

  if (isPostgresConfigured()) {
    try {
      await query(`UPDATE "user" SET role = 'admin' WHERE LOWER(email) = LOWER($1)`, [email]);
    } catch (e) {
      console.error("Postgres makeUserAdmin error:", e);
    }
  }
  return true;
}
