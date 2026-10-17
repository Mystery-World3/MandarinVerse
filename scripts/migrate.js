// Standalone script to run migrations on Neon PostgreSQL
const fs = require("fs");
const path = require("path");
const { Pool } = require("@neondatabase/serverless");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL tidak ditemukan di .env.local atau environment variable.");
    console.log("👉 Silakan salin string koneksi Neon PostgreSQL Anda ke .env.local terlebih dahulu.");
    process.exit(1);
  }

  console.log("🚀 Menghubungkan ke Neon PostgreSQL...");
  const pool = new Pool({ connectionString: dbUrl });
  const schemaPath = path.join(__dirname, "..", "src", "lib", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  try {
    const client = await pool.connect();
    console.log("📦 Menjalankan migrasi skema tabel MandarinVerse...");
    await client.query(sql);
    client.release();
    console.log("✅ Berhasil! Semua tabel, indeks, dan relasi telah siap di database Neon PostgreSQL Anda.");
  } catch (err) {
    console.error("❌ Gagal menjalankan migrasi:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
