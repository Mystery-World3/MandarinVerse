import { NextRequest, NextResponse } from "next/server";
import { getLessonById } from "@/lib/db/repository";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Silakan masuk untuk melihat materi belajar." }, { status: 401 });
  try {
    const { lessonId } = await params;
    const data = await getLessonById(lessonId);

    if (!data) {
      return NextResponse.json({ success: false, error: "Pelajaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
