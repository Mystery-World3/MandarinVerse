import { describe, it, expect } from "vitest";
import { INITIAL_COURSES, INITIAL_ACHIEVEMENTS } from "../curriculum/courses-data";

describe("Curriculum & Course Structure", () => {
  it("contains all 8 curriculum paths (Path 0 to Path 7)", () => {
    expect(INITIAL_COURSES).toHaveLength(8);

    const pathIndices = INITIAL_COURSES.map((c) => c.pathIndex);
    expect(pathIndices).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("ensures every lesson has valid objectives, vocabulary, and summary", () => {
    for (const course of INITIAL_COURSES) {
      expect(course.title).toBeTruthy();
      expect(course.titleChinese).toBeTruthy();
      expect(course.units).toBeDefined();

      for (const unit of course.units || []) {
        for (const lesson of unit.lessons || []) {
          expect(lesson.title).toBeTruthy();
          expect(lesson.titleChinese).toBeTruthy();
          expect(lesson.content.objectives.length).toBeGreaterThan(0);
          expect(lesson.content.vocabulary.length).toBeGreaterThan(0);
          expect(lesson.content.summary).toBeTruthy();

          // Every vocab item must have Hanzi, tone-marked Pinyin, and Indonesian translation
          for (const vocab of lesson.content.vocabulary) {
            expect(vocab.hanzi).toBeTruthy();
            expect(vocab.pinyin).toBeTruthy();
            expect(vocab.indonesian).toBeTruthy();
            expect(vocab.partOfSpeech).toBeTruthy();
          }
        }
      }
    }
  });

  it("validates that all quizzes have questions with options and explanations", () => {
    for (const course of INITIAL_COURSES) {
      for (const unit of course.units || []) {
        for (const quiz of unit.quizzes || []) {
          expect(quiz.title).toBeTruthy();
          expect(quiz.passingScore).toBeGreaterThanOrEqual(50);
          expect(quiz.questions?.length).toBeGreaterThan(0);

          for (const q of quiz.questions || []) {
            expect(q.prompt).toBeTruthy();
            expect(q.options.length).toBeGreaterThanOrEqual(2);
            expect(q.correctAnswer).toBeDefined();
            expect(q.explanation).toBeTruthy();
          }
        }
      }
    }
  });

  it("contains pre-configured achievements", () => {
    expect(INITIAL_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(5);
    for (const ach of INITIAL_ACHIEVEMENTS) {
      expect(ach.code).toBeTruthy();
      expect(ach.title).toBeTruthy();
      expect(ach.xpReward).toBeGreaterThan(0);
    }
  });
});
