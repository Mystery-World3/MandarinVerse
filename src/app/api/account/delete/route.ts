import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getPool } from "@/lib/db";

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const pool = getPool();
  if (!pool) {
    return NextResponse.json({ success: false, error: "Database belum dikonfigurasi." }, { status: 503 });
  }

  try {
    // User-owned rows reference "user" with ON DELETE CASCADE, so related
    // progress, SRS, activity, AI conversations, sessions and accounts are removed.
    const result = await pool.query('DELETE FROM "user" WHERE "id" = $1 RETURNING "id"', [user.id]);
    if (result.rowCount !== 1) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan atau sudah dihapus." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json({ success: false, error: "Akun belum dapat dihapus. Silakan coba lagi nanti." }, { status: 500 });
  }
}
