-- =========================================================
-- MandarinVerse Database Schema (PostgreSQL / Neon)
-- =========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BETTER AUTH USERS TABLE
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'learner',
    "goal" TEXT,
    "dailyTargetMinutes" INTEGER DEFAULT 10,
    "level" TEXT DEFAULT 'Beginner',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

-- 3. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COURSES
CREATE TABLE IF NOT EXISTS "courses" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "title_chinese" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'Beginner',
    "path_index" INTEGER NOT NULL DEFAULT 0,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. UNITS
CREATE TABLE IF NOT EXISTS "units" (
    "id" TEXT PRIMARY KEY,
    "course_id" TEXT NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "title_chinese" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. LESSONS
CREATE TABLE IF NOT EXISTS "lessons" (
    "id" TEXT PRIMARY KEY,
    "unit_id" TEXT NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "title_chinese" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 10,
    "content_json" JSONB NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. VOCABULARY
CREATE TABLE IF NOT EXISTS "vocabulary" (
    "id" TEXT PRIMARY KEY,
    "lesson_id" TEXT REFERENCES "lessons"("id") ON DELETE SET NULL,
    "hanzi" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "indonesian" TEXT NOT NULL,
    "english" TEXT,
    "part_of_speech" TEXT NOT NULL,
    "audio_url" TEXT,
    "example_chinese" TEXT,
    "example_pinyin" TEXT,
    "example_indonesian" TEXT,
    "mnemonic" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. QUIZZES
CREATE TABLE IF NOT EXISTS "quizzes" (
    "id" TEXT PRIMARY KEY,
    "lesson_id" TEXT REFERENCES "lessons"("id") ON DELETE SET NULL,
    "unit_id" TEXT REFERENCES "units"("id") ON DELETE SET NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS "quiz_questions" (
    "id" TEXT PRIMARY KEY,
    "quiz_id" TEXT NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_pinyin" TEXT,
    "prompt_audio" TEXT,
    "options_json" JSONB NOT NULL,
    "correct_answer" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. LESSON PROGRESS (PER USER)
CREATE TABLE IF NOT EXISTS "lesson_progress" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "lesson_id" TEXT NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP WITH TIME ZONE,
    "score" INTEGER,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "lesson_id")
);

-- 12. QUIZ ATTEMPTS (PER USER)
CREATE TABLE IF NOT EXISTS "quiz_attempts" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "quiz_id" TEXT NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "is_passed" BOOLEAN NOT NULL,
    "answers_json" JSONB NOT NULL,
    "completed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. USER VOCABULARY (SPACED REPETITION)
CREATE TABLE IF NOT EXISTS "user_vocabulary" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "vocabulary_id" TEXT NOT NULL REFERENCES "vocabulary"("id") ON DELETE CASCADE,
    "review_status" TEXT NOT NULL DEFAULT 'new',
    "ease_factor" NUMERIC(4, 2) NOT NULL DEFAULT 2.50,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "next_review_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "vocabulary_id")
);

-- 14. STUDY ACTIVITY
CREATE TABLE IF NOT EXISTS "study_activities" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "minutes_spent" INTEGER NOT NULL DEFAULT 0,
    "xp_gained" INTEGER NOT NULL DEFAULT 0,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "quizzes_taken" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "date")
);

-- 15. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS "achievements" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "title_chinese" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 50,
    "condition_type" TEXT NOT NULL,
    "condition_threshold" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "achievement_id" TEXT NOT NULL REFERENCES "achievements"("id") ON DELETE CASCADE,
    "unlocked_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "achievement_id")
);

-- 17. AI CONVERSATIONS
CREATE TABLE IF NOT EXISTS "ai_conversations" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "message_role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lesson_context" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_units_course_id ON "units"("course_id");
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON "lessons"("unit_id");
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson_id ON "vocabulary"("lesson_id");
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON "quiz_questions"("quiz_id");
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON "lesson_progress"("user_id");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON "quiz_attempts"("user_id");
CREATE INDEX IF NOT EXISTS idx_user_vocab_due ON "user_vocabulary"("user_id", "next_review_date");
CREATE INDEX IF NOT EXISTS idx_study_activities_user_date ON "study_activities"("user_id", "date");
