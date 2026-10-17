import { NextResponse } from "next/server";
import { getUserVocabulary } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const vocabulary = await getUserVocabulary(user.id);
    return NextResponse.json({ success: true, vocabulary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
