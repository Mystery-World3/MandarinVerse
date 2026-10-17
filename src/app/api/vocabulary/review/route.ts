import { NextRequest, NextResponse } from "next/server";
import { reviewUserVocabulary } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const ReviewSchema = z.object({
  vocabularyId: z.string(),
  grade: z.enum(["again", "hard", "good", "easy"]),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { vocabularyId, grade } = ReviewSchema.parse(body);

    const updated = await reviewUserVocabulary(user.id, vocabularyId, grade);

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
