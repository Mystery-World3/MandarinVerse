import { NextResponse } from "next/server";
import { getUserVocabulary } from "@/lib/db/repository";
import { getRequiredUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getRequiredUser();
    const vocabulary = await getUserVocabulary(user.id);
    return NextResponse.json({ success: true, vocabulary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
