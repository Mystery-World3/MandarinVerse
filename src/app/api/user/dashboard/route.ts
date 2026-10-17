import { NextResponse } from "next/server";
import { getUserDashboardData } from "@/lib/db/repository";
import { getRequiredUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getRequiredUser();
    const data = await getUserDashboardData(user.id);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
