
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            { success: false, error: "Tidak terautentikasi" },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            role: user.role,
            },
        });
    }
