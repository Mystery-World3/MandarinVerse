/**
 * Seed runner for MandarinVerse curriculum.
 * Invoked by scripts/seed.js via tsx.
 */
import { runSeed } from "../src/lib/db/seed";

async function main() {
  const result = await runSeed();
  if (result.success) {
    console.log(`✅ ${result.message}`);
    process.exit(0);
  } else {
    console.error(`❌ ${result.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Seeding gagal dengan error tidak terduga:", err);
  process.exit(1);
});
