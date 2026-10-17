import { NextRequest, NextResponse } from "next/server";
import { completeLesson } from "@/lib/db/repository";
import { getRequiredUser } from "@/lib/session";
import { z } from "zod";

const CompleteBodySchema = z.object({
  timeSpentSeconds: z.number().optional().default(300),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const user = await getRequiredUser();

    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Body is optional
    }

    const { timeSpentSeconds } = CompleteBodySchema.parse(body);
    const result = await completeLesson(user.id, lessonId, timeSpentSeconds);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
