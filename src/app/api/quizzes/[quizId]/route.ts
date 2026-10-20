import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getQuizById } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Silakan masuk untuk melihat materi belajar." }, { status: 401 });
  try {
    const { quizId } = await params;
    const data = await getQuizById(quizId);

    if (!data) {
      return NextResponse.json({ success: false, error: "Kuis tidak ditemukan" }, { status: 404 });
    }

    // Strip correctAnswer and explanation to prevent cheating before submission
    const sanitizedQuestions = (data.quiz.questions || []).map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      promptPinyin: q.promptPinyin,
      promptAudio: q.promptAudio,
      options: q.options,
      orderIndex: q.orderIndex,
    }));

    return NextResponse.json({
      success: true,
      quiz: {
        ...data.quiz,
        questions: sanitizedQuestions,
      },
      course: data.course,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
