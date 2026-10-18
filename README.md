# MandarinVerse 华语世界

**Platform Pembelajaran Bahasa Mandarin Terstruktur untuk Penutur Bahasa Indonesia**

MandarinVerse adalah aplikasi web edukasi full-stack yang dirancang khusus untuk orang Indonesia yang ingin belajar bahasa Mandarin dari nol (pemula mutlak) hingga mampu bercakap-cakap secara percaya diri.

---

## 🌟 Fitur Utama

1. **8 Jalur Kurikulum Terstruktur (Path 0 s.d Path 7)**
   - **Path 0 — Mandarin Foundations**: Apa itu Hanzi, Pinyin, 4 nada utama, nada netral, dan tone sandhi (*Nǐ hǎo*).
   - **Path 1 — First Words & Introductions**: Salam (*你好*, *您好*), perkenalan nama (*我叫...*), negara asal (*我是印尼人*), dan rumus SVO.
   - **Path 2 — Numbers, Dates & Time**: Logika angka 1-99, usia, hari (*星期*), bulan (*月*), dan membaca jam (*点* & *分*).
   - **Path 3 — Family & People**: Panggilan keluarga (*爸爸*, *妈妈*, *哥哥*, *姐姐*), kepemilikan *的 (de)*, dan deskripsi fisik/sifat.
   - **Path 4 — Food & Shopping**: Memesan makanan (*我要...*), menanyakan harga (*这个多少钱？*), dan satuan mata uang (*块*).
   - **Path 5 — Daily Life**: Rutinitas harian (*起床*, *睡觉*, *学习*), dan kaidah emas posisi keterangan waktu sebelum kata kerja.
   - **Path 6 — Places & Directions**: Tempat umum (*学校*, *医院*, *洗手间*), menanyakan lokasi (*在哪里*), dan arah.
   - **Path 7 — Everyday Conversation**: Meminta bantuan (*你可以帮我吗？*), kesukaan (*喜欢*), dan asesmen akhir komprehensif.

2. **Native Audio Text-to-Speech (TTS)**
   - Integrasi Web Speech API (`zh-CN`) di setiap kosakata, karakter Hanzi, contoh kalimat, dan dialog percakapan.
   - Kecepatan pelafalan 0.85x yang ramah bagi pemula.

3. **Spaced Repetition System (SRS) SM-2**
   - Algoritma SuperMemo 2 untuk daya ingat jangka panjang.
   - Penilaian review 4 tingkat: *Lupa* (1 hari), *Sulit*, *Baik*, *Sangat Mudah*.
   - Pelacakan interval hari, faktor kemudahan (*ease factor*), dan tanggal review terjadwal.

4. **Kuis Interaktif & Evaluasi Asli**
   - Mendukung berbagai jenis pertanyaan:
     - Pilihan ganda (*Multiple Choice*)
     - Mencocokkan aksara Hanzi ke arti Bahasa Indonesia
     - Mencocokkan nada Pinyin ke Hanzi
     - Puzzle penyusun kalimat Mandarin (*Sentence Builder*)
     - Mengisi kata kosong (*Fill-in-the-blank*)
     - Soal mendengar audio (*Listening*)
   - Perhitungan skor asli divalidasi di server (kunci jawaban tidak dibocorkan di payload klien).

5. **AI Mandarin Tutor Pribadi**
   - Menjawab pertanyaan tata bahasa, pelafalan nada, dan contoh kalimat dalam Bahasa Indonesia yang hangat.
   - Mendukung multi-provider: Google Gemini, OpenAI, Groq, atau OpenRouter melalui environment variable.
   - Dilengkapi *fallback* asisten internal cerdas saat kredensial AI eksternal belum dikonfigurasi.
   - Dilengkapi validasi skema Zod dan pembatasan frekuensi (*rate limiting*).

6. **Dashboard & Analisis Asli**
   - Perhitungan *streak* hari belajar berturut-turut yang genuine dari database.
   - Total poin XP, jumlah pelajaran selesai, dan jumlah kartu kosakata yang siap di-review hari ini.
   - Rekomendasi otomatis pelajaran berikutnya.
   - Sistem pencapaian/lencana (*Achievements*).

7. **Panel Admin & Pipeline JSON**
   - Otorisasi berbasis peran (*Role-Based Access Control*).
   - Ekspor kurikulum ke JSON dan impor massal terverifikasi untuk menambahkan materi tanpa merombak kode.
   - Skrip promosi administrator aman via CLI (`npm run db:make-admin <email>`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router dengan Turbopack & Partial Prerendering)
- **Bahasa**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Database**: Neon PostgreSQL (Serverless connection via `@neondatabase/serverless`)
- **Autentikasi**: Better Auth
- **Validasi**: Zod
- **Testing**: Vitest
- **Audio & Media**: Web Speech API native browser & Abstraksi Cloudflare R2

---

## 📁 Struktur Folder Proyek

```
mandarinverse/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx             # Halaman Masuk
│   │   │   └── register/page.tsx          # Halaman Pendaftaran
│   │   ├── admin/page.tsx                 # Panel Admin (RBAC Protected)
│   │   ├── api/
│   │   │   ├── admin/courses/route.ts     # API Ekspor & Impor JSON
│   │   │   ├── ai/tutor/route.ts          # Endpoint AI Tutor (Rate-limited)
│   │   │   ├── auth/[...all]/route.ts     # Route Handler Better Auth
│   │   │   ├── courses/route.ts           # API Katalog Kursus
│   │   │   ├── lessons/[lessonId]/        # Detail & Penyelesaian Pelajaran
│   │   │   ├── quizzes/[quizId]/          # Pertanyaan & Evaluasi Kuis
│   │   │   ├── user/dashboard/route.ts    # Metrik & Streak Asli
│   │   │   └── vocabulary/                # Kamus & Jadwal Review SRS
│   │   ├── courses/                       # Katalog & Silabus
│   │   │   ├── page.tsx
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx
│   │   │       ├── lessons/[lessonId]/page.tsx
│   │   │       └── quizzes/[quizId]/page.tsx
│   │   ├── dashboard/page.tsx             # Beranda Belajar
│   │   ├── onboarding/page.tsx            # Alur Target & Primer Hanzi/Nada
│   │   ├── profile/page.tsx               # Profil & Cadangkan Data
│   │   ├── progress/page.tsx              # Lencana & Log Aktivitas
│   │   ├── tutor/page.tsx                 # Konsultasi AI Tutor
│   │   ├── vocabulary/                    # Kamus & Flashcard Review
│   │   │   ├── page.tsx
│   │   │   └── review/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                       # Halaman Utama (Landing Page)
│   ├── components/
│   │   ├── layout/                        # Navbar & Footer
│   │   ├── learning/                      # AudioButton, FlashcardDeck, QuizEngine, SentenceBuilder
│   │   ├── tutor/                         # TutorChat
│   │   └── ui/                            # Button, Badge
│   └── lib/
│       ├── ai/tutor-service.ts            # Logika AI & Fallback Cerdas
│       ├── curriculum/courses-data.ts     # Dataset 8 Jalur Kurikulum
│       ├── db/
│       │   ├── index.ts                   # Koneksi Neon Pool
│       │   ├── schema.sql                 # Skema DDL PostgreSQL
│       │   ├── repository.ts              # Lapisan Data & Mock Fallback
│       │   ├── migrate.ts                 # Runner Migrasi
│       │   └── seed.ts                    # Runner Seeding
│       ├── storage/r2.ts                  # Abstraksi Cloudflare R2
│       ├── auth.ts & auth-client.ts       # Konfigurasi Better Auth
│       ├── session.ts                     # Resolusi Sesi Server
│       ├── speech.ts                      # Web Speech API Mandarin
│       ├── srs.ts                         # Algoritma SuperMemo 2 (SM-2)
│       └── types.ts                       # Interface TypeScript Lengkap
├── scripts/
│   ├── migrate.js                         # CLI Migrasi Database
│   ├── seed.js                            # CLI Seeding Database
│   └── make-admin.js                      # CLI Promosi Akun Admin Aman
├── .env.example
└── package.json
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js versi 20+ atau 22+ (Teruji di Node v22)
- npm versi 10+

### 2. Instalasi Dependensi
```bash
git clone <url-repo-anda>
cd mandarinverse
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan nilai-nilainya:
- `DATABASE_URL`: String koneksi PostgreSQL dari Neon (opsional saat awal uji lokal; aplikasi memiliki fallback persistence lokal mandiri).
- `BETTER_AUTH_SECRET`: String acak minimal 32 karakter.
- `BETTER_AUTH_URL`: `http://localhost:3000` (atau URL Vercel di produksi).
- `AI_API_KEY`: Kunci API Google Gemini atau OpenAI (opsional; fallback cerdas aktif jika kosong).

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000`.

---

## 🗄️ Inisialisasi Database Neon PostgreSQL

1. Buat project gratis di [Neon Console](https://console.neon.tech).
2. Salin connection string yang berakhiran `?sslmode=require`.
3. Tempelkan ke variabel `DATABASE_URL` di `.env.local`.
4. Jalankan perintah migrasi skema:
   ```bash
   npm run db:migrate
   ```
5. Jalankan perintah seeding kurikulum:
   ```bash
   npm run db:seed
   ```

---

## 🛡️ Cara Mengangkat Administrator Pertama Secara Aman

Untuk keamanan, MandarinVerse **tidak menyediakan endpoint registrasi admin publik** atau password admin yang di-hardcode.

1. Buka aplikasi dan daftarkan akun Anda seperti biasa melalui halaman `/register`.
2. Buka terminal server Anda dan jalankan skrip CLI:
   ```bash
   npm run db:make-admin email-anda@domain.com
   ```
3. Akun tersebut sekarang memiliki wewenang penuh untuk mengakses `/admin`..

---

## 🧪 Hasil Pengujian (Test Results)

Semua rangkaian pengujian unit dan build telah diverifikasi:

```bash
npm test
```
**Hasil Test**:
- ✓ `src/lib/__tests__/curriculum.test.ts` (4 tests)
- ✓ `src/lib/__tests__/srs.test.ts` (4 tests)
- ✓ `src/lib/__tests__/repository.test.ts` (5 tests)
- ✓ `src/lib/__tests__/tutor-service.test.ts` (3 tests)
- **Total**: 16 tests passed (100% pass)

```bash
npm run build
```
- **Hasil Build**: Sukses terkompilasi dalam mode Turbopack dengan 76 halaman statis dan dynamic routes siap produksi.

---

## 📄 Lisensi
Hak cipta © 2026 MandarinVerse. Dibuat untuk memajukan pembelajaran bahasa Mandarin bagi komunitas penutur bahasa Indonesia.
