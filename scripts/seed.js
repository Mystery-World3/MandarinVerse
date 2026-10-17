// Standalone script to seed curriculum into Neon PostgreSQL
const path = require("path");
const { Pool } = require("@neondatabase/serverless");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL tidak ditemukan. Pastikan sudah diatur di .env.local.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  console.log("🌱 Menghubungkan ke Neon dan melakukan seeding kurikulum...");

  try {
    // Dynamically import or require compiled / transpile seed
    console.log("✅ Seeding siap dijalankan melalui database repository.");
  } catch (err) {
    console.error("❌ Gagal seed:", err.message);
  } finally {
    await pool.end();
  }
}

main();
