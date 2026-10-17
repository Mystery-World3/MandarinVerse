import { describe, it, expect } from "vitest";
import {
  TutorRequestSchema,
  askMandarinTutor,
  checkRateLimit,
} from "../ai/tutor-service";

describe("AI Tutor Service", () => {
  it("validates request schema with Zod", () => {
    // Empty message should fail
    const invalid = TutorRequestSchema.safeParse({ message: "" });
    expect(invalid.success).toBe(false);

    // Valid message passes
    const valid = TutorRequestSchema.safeParse({
      message: "Bagaimana cara menyapa dalam bahasa Mandarin?",
      lessonContext: "Salam dan Perkenalan",
    });
    expect(valid.success).toBe(true);
  });

  it("handles rate limiting properly", () => {
    const id = "test-user-rate-limit";
    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(id, 5)).toBe(true);
    }
    // 6th request must be blocked
    expect(checkRateLimit(id, 5)).toBe(false);
  });

  it("returns an honest fallback when AI_API_KEY is not configured", async () => {
    delete process.env.AI_API_KEY;

    const res = await askMandarinTutor({
      message: "Bagaimana cara pengucapan 4 nada?",
    });

    expect(res.configured).toBe(false);
    expect(res.source).toBe("fallback");
    expect(res.reply).toContain("Nada 1");
    expect(res.reply).toContain("Nada 4");
  });
});
