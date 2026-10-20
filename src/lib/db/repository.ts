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

// ---------------------------------------------------------------------------
// Production guard — local filesystem storage is NOT supported on Vercel.
// In production, DATABASE_URL is required for all user data operations.
// ---------------------------------------------------------------------------

function assertDatabaseInProduction() {
  if (process.env.NODE_ENV === "production" && !isPostgresConfigured()) {
    throw new Error(
      "DATABASE_URL belum dikonfigurasi. Penyimpanan lokal tidak didukung di lingkungan produksi (Vercel). " +
      "Tambahkan DATABASE_URL Neon PostgreSQL ke environment variables."
    );
  }
}

// Path for local mock file persistence when DATABASE_URL is not set (dev only)
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
    users: [],
  };
}

let memoryStore: LocalStore | null = null;

/**
 * Returns the in-process local store (development only).
 * Throws in production if DATABASE_URL is not configured.
 */
function getLocalStore(): LocalStore {
  assertDatabaseInProduction();

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
        `SELECT id
         FROM courses
         WHERE is_published = true`
      );

      const publishedIds = new Set(
        rows.map((row: any) => String(row.id))
      );

      // Pertahankan struktur units dan lessons dari kurikulum lokal.
      return INITIAL_COURSES.filter(
        (course) =>
          course.isPublished &&
          publishedIds.has(String(course.id))
      );
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `Gagal memuat daftar kursus dari database: ${(e as Error).message}`
        );
      }

      console.error("Postgres getCourses error:", e);
    }
  }

  return getLocalStore().courses.filter(
    (course) => course.isPublished
  );
}


export async function getCourseById(courseId: string): Promise<Course | null> {
  const courses = await getCourses();
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  return course || null;
}

export async function getLessonById(lessonId: string): Promise<{ lesson: Lesson; course: Course } | null> {
  // When Postgres is configured, lessons are nested inside courses loaded from the curriculum.
  // The canonical in-memory curriculum is always present and is the source of truth for lesson content.
  const courses = isPostgresConfigured()
    ? INITIAL_COURSES
    : getLocalStore().courses;

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
  const courses = isPostgresConfigured()
    ? INITIAL_COURSES
    : getLocalStore().courses;

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
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Gagal memuat progres pelajaran: ${(e as Error).message}`);
      }
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
  const now = new Date().toISOString();

  if (isPostgresConfigured()) {
    try {
      // Check if this is a first completion
      const existing = await query<any>(
        `SELECT id FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2`,
        [userId, lessonId]
      );
      const isFirstCompletion = existing.length === 0;
      const xpGained = isFirstCompletion ? 50 : 0;

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

      // Record study activity in Postgres
      await recordActivityPg(
        userId,
        Math.max(1, Math.round(timeSpentSeconds / 60)),
        xpGained,
        isFirstCompletion ? 1 : 0,
        0,
        now
      );

      // Auto-save vocabulary from this lesson
      const lessonData = await getLessonById(lessonId);
      if (lessonData?.lesson.content.vocabulary) {
        for (const vocab of lessonData.lesson.content.vocabulary) {
          await saveUserVocabularyPg(userId, vocab);
        }
      }

      await checkAndAwardAchievementsPg(userId, now);
      return { success: true, isFirstCompletion, xpGained };
    } catch (e) {
      throw new Error(`Gagal menyimpan penyelesaian pelajaran: ${(e as Error).message}`);
    }
  }

  // --- Local store (development only) ---
  const store = getLocalStore();
  const existingIdx = store.lessonProgress.findIndex(
    (p) => p.userId === userId && p.lessonId === lessonId
  );

  let isFirstCompletion = false;

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

  const xpGained = isFirstCompletion ? 50 : 0;
  recordActivity(
    userId,
    Math.max(1, Math.round(timeSpentSeconds / 60)),
    xpGained,
    isFirstCompletion ? 1 : 0,
    0
  );

  const lessonData = await getLessonById(lessonId);
  if (lessonData?.lesson.content.vocabulary) {
    for (const vocab of lessonData.lesson.content.vocabulary) {
      saveUserVocabulary(userId, vocab);
    }
  }

  await checkAndAwardAchievements(userId);
  saveLocalStore(store);

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
      await recordActivityPg(userId, 10, xpGained, 0, 1, attempt.completedAt);
      await checkAndAwardAchievementsPg(userId, attempt.completedAt);
      return { attempt, questionResults };
    } catch (e) {
      throw new Error(`Gagal menyimpan hasil kuis: ${(e as Error).message}`);
    }
  }

  // --- Local store (development only) ---
  const store = getLocalStore();
  store.quizAttempts.push(attempt);
  recordActivity(userId, 10, xpGained, 0, 1);
  await checkAndAwardAchievements(userId);
  saveLocalStore(store);

  return { attempt, questionResults };
}

// ==========================================
// VOCABULARY & SPACED REPETITION (SRS)
// ==========================================

/** Save vocabulary to Postgres (upsert). Used internally in production. */
async function saveUserVocabularyPg(userId: string, vocab: VocabularyItem): Promise<void> {
  const now = new Date().toISOString();
  await query(
    `INSERT INTO user_vocabulary (id, user_id, vocabulary_id, review_status, ease_factor, interval_days, repetitions, next_review_date, created_at)
     VALUES ($1, $2, $3, 'new', 2.5, 0, 0, $4, $4)
     ON CONFLICT (user_id, vocabulary_id) DO NOTHING`,
    [`uv-${Date.now()}-${Math.random().toString(36).substring(7)}`, userId, vocab.id, now]
  );
}

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
  if (isPostgresConfigured()) {
    try {
      // Join with vocabulary table to get full vocab details
      const rows = await query<any>(
        `SELECT uv.id, uv.user_id as "userId", uv.vocabulary_id as "vocabularyId",
                uv.review_status as "reviewStatus", uv.ease_factor as "easeFactor",
                uv.interval_days as "intervalDays", uv.repetitions,
                uv.next_review_date as "nextReviewDate", uv.last_reviewed_at as "lastReviewedAt",
                uv.created_at as "createdAt",
                v.hanzi, v.pinyin, v.indonesian, v.english, v.part_of_speech as "partOfSpeech",
                v.example_chinese as "exampleChinese", v.example_pinyin as "examplePinyin",
                v.example_indonesian as "exampleIndonesian", v.mnemonic
         FROM user_vocabulary uv
         JOIN vocabulary v ON v.id = uv.vocabulary_id
         WHERE uv.user_id = $1`,
        [userId]
      );

      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        vocabularyId: r.vocabularyId,
        reviewStatus: r.reviewStatus,
        easeFactor: Number(r.easeFactor),
        intervalDays: r.intervalDays,
        repetitions: r.repetitions,
        nextReviewDate: r.nextReviewDate,
        lastReviewedAt: r.lastReviewedAt,
        createdAt: r.createdAt,
        vocabulary: {
          id: r.vocabularyId,
          hanzi: r.hanzi,
          pinyin: r.pinyin,
          indonesian: r.indonesian,
          english: r.english,
          partOfSpeech: r.partOfSpeech,
          exampleChinese: r.exampleChinese,
          examplePinyin: r.examplePinyin,
          exampleIndonesian: r.exampleIndonesian,
          mnemonic: r.mnemonic,
        },
      }));
    } catch (e) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`Gagal memuat kosakata: ${(e as Error).message}`);
      }
      console.error("Postgres getUserVocabulary error:", e);
    }
  }

  const store = getLocalStore();
  return store.userVocabulary.filter((uv) => uv.userId === userId);
}

export async function reviewUserVocabulary(
  userId: string,
  vocabularyId: string,
  grade: ReviewGrade
): Promise<UserVocabulary> {
  if (isPostgresConfigured()) {
    try {
      // Get current SRS state
      const rows = await query<any>(
        `SELECT uv.id, uv.repetitions, uv.ease_factor as "easeFactor", uv.interval_days as "intervalDays",
                uv.review_status as "reviewStatus", uv.next_review_date as "nextReviewDate",
                v.id as "vocabId", v.hanzi, v.pinyin, v.indonesian, v.english,
                v.part_of_speech as "partOfSpeech", v.example_chinese as "exampleChinese",
                v.example_pinyin as "examplePinyin", v.example_indonesian as "exampleIndonesian", v.mnemonic
         FROM user_vocabulary uv
         JOIN vocabulary v ON v.id = uv.vocabulary_id
         WHERE uv.user_id = $1 AND uv.vocabulary_id = $2`,
        [userId, vocabularyId]
      );

      if (rows.length === 0) {
        // Try to add it first
        const vocabRows = await query<any>(`SELECT * FROM vocabulary WHERE id = $1`, [vocabularyId]);
        if (vocabRows.length === 0) throw new Error("Kosakata tidak ditemukan");
        await saveUserVocabularyPg(userId, {
          id: vocabRows[0].id,
          hanzi: vocabRows[0].hanzi,
          pinyin: vocabRows[0].pinyin,
          indonesian: vocabRows[0].indonesian,
          english: vocabRows[0].english,
          partOfSpeech: vocabRows[0].part_of_speech,
          exampleChinese: vocabRows[0].example_chinese,
          examplePinyin: vocabRows[0].example_pinyin,
          exampleIndonesian: vocabRows[0].example_indonesian,
          mnemonic: vocabRows[0].mnemonic,
        } as VocabularyItem);
        // Refetch
        return reviewUserVocabulary(userId, vocabularyId, grade);
      }

      const row = rows[0];
      const nextSchedule = calculateNextReview({
        repetitions: row.repetitions,
        easeFactor: Number(row.easeFactor),
        intervalDays: row.intervalDays,
        grade,
      });

      const now = new Date().toISOString();
      await query(
        `UPDATE user_vocabulary SET
           repetitions = $1, ease_factor = $2, interval_days = $3,
           next_review_date = $4, review_status = $5, last_reviewed_at = $6
         WHERE user_id = $7 AND vocabulary_id = $8`,
        [
          nextSchedule.repetitions,
          nextSchedule.easeFactor,
          nextSchedule.intervalDays,
          nextSchedule.nextReviewDate,
          nextSchedule.status,
          now,
          userId,
          vocabularyId,
        ]
      );

      await recordActivityPg(userId, 2, 10, 0, 0, now);

      return {
        id: row.id,
        userId,
        vocabularyId,
        reviewStatus: nextSchedule.status,
        easeFactor: nextSchedule.easeFactor,
        intervalDays: nextSchedule.intervalDays,
        repetitions: nextSchedule.repetitions,
        nextReviewDate: nextSchedule.nextReviewDate,
        lastReviewedAt: now,
        createdAt: row.createdAt || now,
        vocabulary: {
          id: vocabularyId,
          hanzi: row.hanzi,
          pinyin: row.pinyin,
          indonesian: row.indonesian,
          english: row.english,
          partOfSpeech: row.partOfSpeech,
          exampleChinese: row.exampleChinese,
          examplePinyin: row.examplePinyin,
          exampleIndonesian: row.exampleIndonesian,
          mnemonic: row.mnemonic,
        },
      };
    } catch (e) {
      throw new Error(`Gagal menyimpan ulasan kosakata: ${(e as Error).message}`);
    }
  }

  // --- Local store (development only) ---
  const store = getLocalStore();
  let item = store.userVocabulary.find(
    (uv) => uv.userId === userId && uv.vocabularyId === vocabularyId
  );

  if (!item) {
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

/** Upsert a study activity record in Postgres. */
async function recordActivityPg(
  userId: string,
  minutesSpent: number,
  xpGained: number,
  lessonsCompleted: number,
  quizzesTaken: number,
  timestamp: string
) {
  const today = timestamp.split("T")[0];
  await query(
    `INSERT INTO study_activities (id, user_id, date, minutes_spent, xp_gained, lessons_completed, quizzes_taken, created_at)
     VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8::timestamptz)
     ON CONFLICT (user_id, date) DO UPDATE SET
       minutes_spent = study_activities.minutes_spent + EXCLUDED.minutes_spent,
       xp_gained = study_activities.xp_gained + EXCLUDED.xp_gained,
       lessons_completed = study_activities.lessons_completed + EXCLUDED.lessons_completed,
       quizzes_taken = study_activities.quizzes_taken + EXCLUDED.quizzes_taken,
       created_at = EXCLUDED.created_at`,
    [
      `act-${Date.now()}`,
      userId,
      today,
      minutesSpent,
      xpGained,
      lessonsCompleted,
      quizzesTaken,
      timestamp,
    ]
  );
}

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
  if (isPostgresConfigured()) {
    try {
      // Fetch all data from Postgres
      const progressList = await query<any>(
        `SELECT lesson_id as "lessonId" FROM lesson_progress WHERE user_id = $1 AND is_completed = true`,
        [userId]
      );

      const quizAttempts = await query<any>(
        `SELECT percentage FROM quiz_attempts WHERE user_id = $1`,
        [userId]
      );

      const userVocab = await query<any>(
        `SELECT vocabulary_id, next_review_date as "nextReviewDate" FROM user_vocabulary WHERE user_id = $1`,
        [userId]
      );

      const activities = await query<any>(
        `SELECT date, created_at as "timestamp", minutes_spent as "minutesSpent", xp_gained as "xpGained",
                lessons_completed as "lessonsCompleted", quizzes_taken as "quizzesTaken"
         FROM study_activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
        [userId]
      );

      // Calculate streak
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

      const totalXp = activities.reduce((acc: number, curr: any) => acc + (curr.xpGained || 0), 0);

      // Total lessons from curriculum
      let totalLessonsCount = 0;
      for (const c of INITIAL_COURSES) {
        for (const u of c.units || []) {
          totalLessonsCount += (u.lessons || []).length;
        }
      }

      const dueReviewsCount = userVocab.filter((v: any) => isDueForReview(v.nextReviewDate)).length;
      const avgQuizScore =
        quizAttempts.length > 0
          ? Math.round(quizAttempts.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / quizAttempts.length)
          : 0;

      // Next recommended lesson
      const completedLessonIds = new Set(progressList.map((p: any) => p.lessonId));
      let nextLesson = null;
      for (const c of INITIAL_COURSES) {
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

      // Achievements from Postgres
      const unlockedAchievements = await query<any>(
        `SELECT achievement_id as "achievementId" FROM user_achievements WHERE user_id = $1`,
        [userId]
      );
      const unlockedSet = new Set(unlockedAchievements.map((ua: any) => ua.achievementId));
      const achievements = INITIAL_ACHIEVEMENTS.map((ach) => ({
        achievement: ach,
        unlocked: unlockedSet.has(ach.id),
      }));

      // User info from Better Auth user table
      const userRows = await query<any>(
        `SELECT name, email, role, goal, "dailyTargetMinutes" as "dailyTargetMinutes", level
         FROM "user" WHERE id = $1`,
        [userId]
      );
      const dbUser = userRows[0];

      const user: User = {
        id: userId,
        name: dbUser?.name || "Pembelajar Mandarin",
        email: dbUser?.email || "",
        emailVerified: true,
        role: dbUser?.role || "learner",
        goal: dbUser?.goal || "Percakapan Harian",
        dailyTargetMinutes: dbUser?.dailyTargetMinutes || 10,
        level: dbUser?.level || "Beginner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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
    } catch (e) {
      throw new Error(`Gagal memuat data dashboard: ${(e as Error).message}`);
    }
  }

  // --- Local store (development only) ---
  const store = getLocalStore();
  const user = store.users.find((u) => u.id === userId) || {
    id: userId,
    name: "Pembelajar Mandarin",
    email: "learner@mandarinverse.com",
    emailVerified: true,
    role: "learner" as const,
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

  const totalXp = activities.reduce((acc, curr) => acc + curr.xpGained, 0);

  let totalLessonsCount = 0;
  for (const c of store.courses) {
    for (const u of c.units || []) {
      totalLessonsCount += (u.lessons || []).length;
    }
  }

  const dueReviewsCount = userVocab.filter((v) => isDueForReview(v.nextReviewDate)).length;
  const avgQuizScore =
    quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / quizAttempts.length)
      : 0;

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

/**
 * Unlock achievements against PostgreSQL data. The unique constraint on
 * (user_id, achievement_id) prevents duplicate awards across repeated actions.
 */
async function checkAndAwardAchievementsPg(userId: string, timestamp = new Date().toISOString()) {
  const [lessonRows, quizRows, vocabRows, achievementRows, unlockedRows] = await Promise.all([
    query<any>(
      `SELECT COUNT(*)::int AS count FROM lesson_progress WHERE user_id = $1 AND is_completed = true`,
      [userId]
    ),
    query<any>(
      `SELECT COUNT(*)::int AS count FROM quiz_attempts WHERE user_id = $1 AND is_passed = true`,
      [userId]
    ),
    query<any>(
      `SELECT COUNT(*)::int AS count FROM user_vocabulary WHERE user_id = $1`,
      [userId]
    ),
    query<any>(
      `SELECT id, xp_reward AS "xpReward", condition_type AS "conditionType",
              condition_threshold AS "conditionThreshold"
       FROM achievements`
    ),
    query<any>(
      `SELECT achievement_id AS "achievementId" FROM user_achievements WHERE user_id = $1`,
      [userId]
    ),
  ]);

  const counts: Record<string, number> = {
    lessons: Number(lessonRows[0]?.count || 0),
    quizzes: Number(quizRows[0]?.count || 0),
    vocab: Number(vocabRows[0]?.count || 0),
  };
  const unlocked = new Set(unlockedRows.map((row: any) => row.achievementId));

  for (const achievement of achievementRows) {
    if (unlocked.has(achievement.id)) continue;
    const current = counts[achievement.conditionType];
    if (current === undefined || current < Number(achievement.conditionThreshold)) continue;

    const inserted = await query<any>(
      `INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, achievement_id) DO NOTHING
       RETURNING id`,
      [`ua-${userId}-${achievement.id}`, userId, achievement.id, timestamp]
    );

    if (inserted.length > 0) {
      await recordActivityPg(userId, 0, Number(achievement.xpReward || 0), 0, 0, timestamp);
    }
  }
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
  if (isPostgresConfigured()) {
    try {
      const result = await query<any>(
        `UPDATE "user" SET role = 'admin' WHERE LOWER(email) = LOWER($1) RETURNING id`,
        [email]
      );
      return result.length > 0;
    } catch (e) {
      console.error("Postgres makeUserAdmin error:", e);
      return false;
    }
  }

  const store = getLocalStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  user.role = "admin";
  saveLocalStore(store);
  return true;
}
