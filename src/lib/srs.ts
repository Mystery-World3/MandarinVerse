import { ReviewGrade } from "./types";

export interface SrsScheduleInput {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  grade: ReviewGrade;
}

export interface SrsScheduleOutput {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string; // ISO String (UTC date)
  status: "new" | "learning" | "review" | "mastered";
}

/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm adapted for Mandarin vocabulary learning.
 * Grades:
 * - again: Lupa / Salah -> interval diulang (1 hari), reset repetisi
 * - hard: Sulit / Ragu -> interval bertambah sedikit, easeFactor sedikit turun
 * - good: Baik / Ingat -> interval standar bertambah sesuai easeFactor
 * - easy: Sangat Mudah -> interval melompat lebih jauh, easeFactor naik
 */
export function calculateNextReview({
  repetitions,
  easeFactor,
  intervalDays,
  grade,
}: SrsScheduleInput): SrsScheduleOutput {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newIntervalDays = intervalDays;

  // Nilai kualitas SM-2 (0-5 scale)
  const quality = {
    again: 1,
    hard: 3,
    good: 4,
    easy: 5,
  }[grade];

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  // Batas minimum ease factor adalah 1.3 agar tidak macet di interval kecil
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  if (grade === "again") {
    newRepetitions = 0;
    newIntervalDays = 1;
  } else if (grade === "hard") {
    newRepetitions = Math.max(1, newRepetitions);
    newIntervalDays = Math.max(1, Math.round(newIntervalDays * 1.2));
  } else {
    // good or easy
    if (newRepetitions === 0) {
      newIntervalDays = grade === "easy" ? 3 : 1;
      newRepetitions = 1;
    } else if (newRepetitions === 1) {
      newIntervalDays = grade === "easy" ? 6 : 3;
      newRepetitions = 2;
    } else {
      const multiplier = grade === "easy" ? newEaseFactor * 1.3 : newEaseFactor;
      newIntervalDays = Math.round(newIntervalDays * multiplier);
      newRepetitions += 1;
    }
  }

  // Tentukan status penguasaan
  let status: SrsScheduleOutput["status"] = "learning";
  if (newRepetitions === 0) {
    status = "learning";
  } else if (newIntervalDays >= 21) {
    status = "mastered";
  } else if (newRepetitions >= 2) {
    status = "review";
  }

  // Hitung tanggal review berikutnya
  const nextDate = new Date();
  nextDate.setUTCDate(nextDate.getUTCDate() + newIntervalDays);
  nextDate.setUTCHours(0, 0, 0, 0);

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    intervalDays: newIntervalDays,
    nextReviewDate: nextDate.toISOString(),
    status,
  };
}

export function isDueForReview(nextReviewDateStr: string): boolean {
  if (!nextReviewDateStr) return true;
  const reviewDate = new Date(nextReviewDateStr);
  const now = new Date();
  return reviewDate.getTime() <= now.getTime();
}
