import { NextRequest, NextResponse } from "next/server";
import { adminExportAll, adminImportCourses, getCourses } from "@/lib/db/repository";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Akses ditolak: Hanya Administrator yang diizinkan." }, { status: 403 });
  }

  const exportData = await adminExportAll();
  return new NextResponse(exportData, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="mandarinverse-backup-${Date.now()}.json"`,
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Akses ditolak: Hanya Administrator yang diizinkan." }, { status: 403 });
  }

  try {
    const raw = await request.text();
    const result = await adminImportCourses(raw);
    return NextResponse.json({ success: true, count: result.count, message: "Kurikulum berhasil diimpor!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Gagal impor: ${err.message}` }, { status: 400 });
  }
}
