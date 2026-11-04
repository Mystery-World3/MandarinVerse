import { NextResponse } from "next/server";
import { getUserLessonProgress } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const progress = await getUserLessonProgress(user.id);
    return NextResponse.json({
      success: true,
      progress: progress.filter((item) => item.isCompleted).map((item) => ({
        lessonId: item.lessonId,
        isCompleted: item.isCompleted,
        completedAt: item.completedAt,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal memuat progres pelajaran";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
