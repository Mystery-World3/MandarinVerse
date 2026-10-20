import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getCourses } from "@/lib/db/repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Silakan masuk untuk melihat materi belajar." }, { status: 401 });
  try {
    const courses = await getCourses();
    return NextResponse.json({ success: true, courses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
