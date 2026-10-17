import { NextRequest, NextResponse } from "next/server";
import { submitQuizAnswers } from "@/lib/db/repository";
import { getRequiredUser } from "@/lib/session";
import { z } from "zod";

const SubmitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const user = await getRequiredUser();
    const body = await request.json();

    const { answers } = SubmitQuizSchema.parse(body);
    const result = await submitQuizAnswers(user.id, quizId, answers);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
