// Secure CLI script to promote a registered user to Administrator
const fs = require("fs");
const path = require("path");
const { Pool } = require("@neondatabase/serverless");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("\n⚠️  PENGGUNAAN:");
    console.log("   node scripts/make-admin.js <email-pengguna>");
    console.log("   Contoh: node scripts/make-admin.js user@contoh.com\n");
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    console.log(`🔐 Menghubungkan ke PostgreSQL untuk mempromosikan '${email}' menjadi Admin...`);
    const pool = new Pool({ connectionString: dbUrl });
    try {
      const client = await pool.connect();
      const res = await client.query(
        `UPDATE "user" SET role = 'admin' WHERE LOWER(email) = LOWER($1) RETURNING id, name, email, role`,
        [email]
      );
      client.release();

      if (res.rowCount === 0) {
        console.error(`❌ User dengan email '${email}' tidak ditemukan di tabel "user". Silakan daftar akun terlebih dahulu via aplikasi.`);
      } else {
        console.log(`🎉 BERHASIL! User ${res.rows[0].name} (${res.rows[0].email}) sekarang memiliki hak akses ADMIN.`);
      }
    } catch (err) {
      console.error("❌ Terjadi kesalahan query database:", err.message);
    } finally {
      await pool.end();
    }
  } else {
    // Local store fallback
    const storePath = path.join(__dirname, "..", ".data", "store.json");
    if (fs.existsSync(storePath)) {
      try {
        const store = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        const user = (store.users || []).find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          user.role = "admin";
          fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
          console.log(`🎉 BERHASIL! Pengguna '${email}' di storage lokal telah diubah menjadi ADMIN.`);
        } else {
          console.error(`❌ Pengguna '${email}' belum terdaftar di storage lokal.`);
        }
      } catch (e) {
        console.error("❌ Gagal membaca storage lokal:", e.message);
      }
    } else {
      console.log(`ℹ️ Storage lokal belum terbentuk. Jalankan aplikasi terlebih dahulu.`);
    }
  }
}

main();
