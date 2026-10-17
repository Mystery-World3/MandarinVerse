import { describe, it, expect } from "vitest";
import { calculateNextReview, isDueForReview } from "../srs";

describe("Spaced Repetition SM-2 Algorithm", () => {
  it("resets repetition and interval when grade is 'again'", () => {
    const result = calculateNextReview({
      repetitions: 3,
      easeFactor: 2.5,
      intervalDays: 10,
      grade: "again",
    });

    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
    expect(result.status).toBe("learning");
  });

  it("increases interval progressively when grade is 'good'", () => {
    // First review
    const step1 = calculateNextReview({
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      grade: "good",
    });
    expect(step1.repetitions).toBe(1);
    expect(step1.intervalDays).toBe(1);

    // Second review
    const step2 = calculateNextReview({
      repetitions: step1.repetitions,
      easeFactor: step1.easeFactor,
      intervalDays: step1.intervalDays,
      grade: "good",
    });
    expect(step2.repetitions).toBe(2);
    expect(step2.intervalDays).toBe(3);

    // Third review
    const step3 = calculateNextReview({
      repetitions: step2.repetitions,
      easeFactor: step2.easeFactor,
      intervalDays: step2.intervalDays,
      grade: "good",
    });
    expect(step3.repetitions).toBe(3);
    expect(step3.intervalDays).toBeGreaterThan(5);
  });

  it("advances faster when grade is 'easy'", () => {
    const result = calculateNextReview({
      repetitions: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      grade: "easy",
    });

    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(3);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it("accurately detects if review is due", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isDueForReview(yesterday.toISOString())).toBe(true);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    expect(isDueForReview(tomorrow.toISOString())).toBe(false);
  });
});
