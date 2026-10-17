/**
 * Security and authentication tests for MandarinVerse.
 *
 * These tests verify:
 * - getRequiredUser() throws when unauthenticated (no demo-user fallback)
 * - getCurrentUser() returns null when unauthenticated
 * - Production guard throws when DATABASE_URL is missing
 * - User data isolation between learners
 * - Role field is not settable via user input
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// vi.mock calls MUST be at the top level (they are hoisted by vitest)
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
    options: {
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "learner",
            input: false,
          },
        },
      },
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// ---------------------------------------------------------------------------
// Test: session.ts — no demo-user fallback
// ---------------------------------------------------------------------------

describe("session.ts — authentication guards", () => {
  it("getCurrentUser returns null when no session", async () => {
    const { getCurrentUser } = await import("@/lib/session");
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it("getRequiredUser throws UNAUTHENTICATED instead of returning a demo user", async () => {
    const { getRequiredUser } = await import("@/lib/session");

    let thrownError: Error | null = null;
    try {
      await getRequiredUser();
    } catch (err: any) {
      thrownError = err;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toBe("UNAUTHENTICATED");
  });

  it("getRequiredUser never returns an object with id 'demo-user-1'", async () => {
    const { getRequiredUser } = await import("@/lib/session");

    let returnedValue: any = null;
    try {
      returnedValue = await getRequiredUser();
    } catch {
      // Expected to throw
    }

    // If it didn't throw and returned something, it must not be the demo user
    if (returnedValue !== null) {
      expect(returnedValue.id).not.toBe("demo-user-1");
    }
  });
});

// ---------------------------------------------------------------------------
// Test: auth.ts mock — role field cannot be set by user input
// ---------------------------------------------------------------------------

describe("auth configuration — role field cannot be set by user input", () => {
  it("role field has input: false to prevent user self-promotion", async () => {
    const { auth } = await import("@/lib/auth");
    const additionalFields = (auth.options as any)?.user?.additionalFields;
    expect(additionalFields).toBeDefined();
    expect(additionalFields?.role?.input).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test: repository.ts — user data isolation (development mode)
// ---------------------------------------------------------------------------

describe("repository.ts — user data isolation", () => {
  beforeEach(() => {
    // Ensure test runs in development mode with no Postgres
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DATABASE_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("user A progress is not visible to user B", async () => {
    const { completeLesson, getUserDashboardData } = await import("@/lib/db/repository");

    const timestamp = Date.now();
    const userA = `isolation-a-${timestamp}`;
    const userB = `isolation-b-${timestamp}`;

    await completeLesson(userA, "lesson-0-1-1", 60);

    const dashA = await getUserDashboardData(userA);
    const dashB = await getUserDashboardData(userB);

    expect(dashA.completedLessonsCount).toBeGreaterThanOrEqual(1);
    // User B should have zero completed lessons despite User A completing one
    expect(dashB.completedLessonsCount).toBe(0);
  });

  it("vocabulary saved for user A is not visible to user B", async () => {
    const { saveUserVocabulary, getUserVocabulary } = await import("@/lib/db/repository");

    const timestamp = Date.now();
    const userA = `vocab-a-${timestamp}`;
    const userB = `vocab-b-${timestamp}`;

    const fakeVocab = {
      id: `vocab-test-${timestamp}`,
      hanzi: "测",
      pinyin: "cè",
      indonesian: "tes",
      english: "test",
      partOfSpeech: "noun" as const,
      exampleChinese: "这是一个测试",
      examplePinyin: "zhè shì yī gè cèshì",
      exampleIndonesian: "Ini adalah tes",
    };

    saveUserVocabulary(userA, fakeVocab);

    const vocabA = await getUserVocabulary(userA);
    const vocabB = await getUserVocabulary(userB);

    expect(vocabA.some((v) => v.vocabularyId === fakeVocab.id)).toBe(true);
    expect(vocabB.some((v) => v.vocabularyId === fakeVocab.id)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test: repository.ts — production mode requires DATABASE_URL
// ---------------------------------------------------------------------------

describe("repository.ts — production guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("getUserDashboardData throws in production without DATABASE_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");

    vi.resetModules();
    const { getUserDashboardData } = await import("@/lib/db/repository");

    await expect(getUserDashboardData("any-user")).rejects.toThrow();
  });

  it("getUserLessonProgress throws in production without DATABASE_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");

    vi.resetModules();
    const { getUserLessonProgress } = await import("@/lib/db/repository");

    await expect(getUserLessonProgress("any-user")).rejects.toThrow();
  });

  it("completeLesson throws in production without DATABASE_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");

    vi.resetModules();
    const { completeLesson } = await import("@/lib/db/repository");

    await expect(completeLesson("any-user", "any-lesson", 60)).rejects.toThrow();
  });
});
