import { describe, it, expect } from "vitest";
import {
  completeLesson,
  getCourses,
  getLessonById,
  getQuizById,
  getUserDashboardData,
  submitQuizAnswers,
} from "../db/repository";

describe("Data Repository Layer", () => {
  it("fetches published courses with units and lessons", async () => {
    const courses = await getCourses();
    expect(courses.length).toBeGreaterThanOrEqual(8);
    expect(courses[0].slug).toBe("mandarin-foundations");
  });

  it("completes a lesson and updates progress and XP", async () => {
    const testUserId = "user-test-progress-1";
    const lessonId = "lesson-0-1-1";

    const result = await completeLesson(testUserId, lessonId, 180);
    expect(result.success).toBe(true);
    expect(result.xpGained).toBe(50);

    const dashboard = await getUserDashboardData(testUserId);
    expect(dashboard.completedLessonsCount).toBeGreaterThanOrEqual(1);
    expect(dashboard.totalXp).toBeGreaterThanOrEqual(50);
  });

  it("submits quiz and calculates genuine score with server evaluation", async () => {
    const testUserId = "user-test-quiz-1";
    const quizId = "quiz-0-1";

    const quizData = await getQuizById(quizId);
    expect(quizData).not.toBeNull();

    // Submit correct answers
    const answers = {
      "q-0-1-1": "opt-2",
      "q-0-1-2": "opt-a",
      "q-0-1-3": "opt-n2",
      "q-0-1-4": "opt-p1",
      "q-0-1-5": ["w-2", "w-1"],
    };

    const res = await submitQuizAnswers(testUserId, quizId, answers);
    expect(res.attempt.isPassed).toBe(true);
    expect(res.attempt.percentage).toBe(100);
    expect(res.attempt.score).toBe(5);
    expect(res.questionResults.every((r) => r.isCorrect)).toBe(true);
  });

  it("correctly identifies incorrect answers on quiz submit", async () => {
    const testUserId = "user-test-quiz-2";
    const quizId = "quiz-0-1";

    // Submit wrong answers
    const answers = {
      "q-0-1-1": "opt-1", // wrong
      "q-0-1-2": "opt-b", // wrong
    };

    const res = await submitQuizAnswers(testUserId, quizId, answers);
    expect(res.attempt.percentage).toBeLessThan(70);
    expect(res.attempt.isPassed).toBe(false);
  });

  it("protects user data isolation between different learners", async () => {
    const userA = "learner-alice";
    const userB = "learner-bob";

    await completeLesson(userA, "lesson-1-1-1", 120);

    const dataA = await getUserDashboardData(userA);
    const dataB = await getUserDashboardData(userB);

    expect(dataA.completedLessonsCount).toBeGreaterThanOrEqual(1);
    // User B should not see User A's progress
    expect(dataB.completedLessonsCount).toBe(0);
  });
});
