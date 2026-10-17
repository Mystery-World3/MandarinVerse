#!/usr/bin/env node
// Standalone seed script — seeds curriculum and achievements into Neon PostgreSQL.
// Usage: npm run db:seed
// Safe to run multiple times (all inserts use ON CONFLICT DO UPDATE or DO NOTHING).

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL tidak ditemukan.");
    console.error("   Pastikan DATABASE_URL sudah diatur di .env.local (untuk dev) atau environment variables (untuk produksi).");
    process.exit(1);
  }

  console.log("🌱 Memulai seeding kurikulum MandarinVerse ke Neon PostgreSQL...");

  // Use tsx to run the TypeScript seed module
  const { spawnSync } = require("child_process");
  const result = spawnSync(
    "npx",
    ["tsx", "scripts/run-seed.ts"],
    {
      stdio: "inherit",
      shell: true,
      env: process.env,
    }
  );

  if (result.status !== 0) {
    console.error("❌ Seeding gagal.");
    process.exit(result.status || 1);
  }
}

main();
