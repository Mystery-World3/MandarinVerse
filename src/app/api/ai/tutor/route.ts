import { NextRequest, NextResponse } from "next/server";
import { askMandarinTutor, checkRateLimit, TutorRequestSchema } from "@/lib/ai/tutor-service";
import { getRequiredUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const user = await getRequiredUser();

    // Per-user rate limiting: 15 queries per minute
    const isAllowed = checkRateLimit(user.id, 15);
    if (!isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Batas permintaan tercapai. Silakan tunggu 1 menit sebelum bertanya lagi demi menjaga keadilan server.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validated = TutorRequestSchema.parse(body);

    const result = await askMandarinTutor(validated);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
