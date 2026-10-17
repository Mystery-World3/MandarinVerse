import fs from "fs";
import path from "path";
import { isPostgresConfigured, query } from "./index";

export async function runMigrations(): Promise<{ success: boolean; message: string }> {
  if (!isPostgresConfigured()) {
    return {
      success: false,
      message:
        "DATABASE_URL belum dikonfigurasi di environment. Silakan isi DATABASE_URL Neon PostgreSQL di file .env.local",
    };
  }

  try {
    const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    // Execute schema DDL
    await query(sql);

    return {
      success: true,
      message: "Migrasi skema database Neon PostgreSQL berhasil dijalankan!",
    };
  } catch (err: any) {
    console.error("Migration error:", err);
    return {
      success: false,
      message: `Gagal menjalankan migrasi: ${err.message}`,
    };
  }
}
