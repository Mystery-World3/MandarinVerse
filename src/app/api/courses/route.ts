import { NextResponse } from "next/server";
import { getCourses } from "@/lib/db/repository";

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json({ success: true, courses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
