"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Compass,
  Headphones,
  Layers,
  MessageSquare,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import { AudioButton } from "@/components/learning/AudioButton";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  const [activeTone, setActiveTone] = useState(1);

  const toneExamples = [
    { tone: 1, hanzi: "妈", pinyin: "mā", meaning: "Ibu", mark: "— (Tinggi Datar)" },
    { tone: 2, hanzi: "麻", pinyin: "má", meaning: "Rami / Kebas", mark: "/ (Naik Bertanya)" },
    { tone: 3, hanzi: "马", pinyin: "mǎ", meaning: "Kuda", mark: "V (Rendah Ayun)" },
    { tone: 4, hanzi: "骂", pinyin: "mà", meaning: "Memarahi", mark: "\\ (Hentak Turun)" },
  ];

  const curriculumPaths = [
    {
      num: "0",
      title: "Mandarin Foundations",
      titleChinese: "中文基础",
      desc: "Hanzi, Pinyin, 4 nada utama, dan aturan pelafalan yang benar dari nol.",
      topics: ["Apa itu Hanzi & Pinyin", "4 Nada Utama", "Tone Sandhi (Nǐ hǎo)"],
    },
    {
      num: "1",
      title: "First Words & Introductions",
      titleChinese: "问候与介绍",
      desc: "Menyapa, memperkenalkan nama, negara asal, dan pola kalimat dasar.",
      topics: ["你好 & 您好", "我叫... (Nama)", "我是印尼人 (Kewarganegaraan)"],
    },
    {
      num: "2",
      title: "Numbers, Dates & Time",
      titleChinese: "数字与时间",
      desc: "Angka 1-100, usia, nomor telepon, hari, kalender, dan membaca jam.",
      topics: ["Logika Angka 1-99", "Hari & Bulan", "Membaca Jam (点 & 分)"],
    },
    {
      num: "3",
      title: "Family & People",
      titleChinese: "家人与朋友",
      desc: "Panggilan anggota keluarga, partikel kepemilikan 的 (de), dan deskripsi orang.",
      topics: ["Ayah, Ibu, Kakak, Adik", "Kepemilikan 的", "Describing People"],
    },
    {
      num: "4",
      title: "Food & Shopping",
      titleChinese: "美食与购物",
      desc: "Memesan makanan di restoran, menanyakan harga (多少钱), dan satuan kuantitas.",
      topics: ["Makanan & Minuman", "我要... (Pesan)", "这个多少钱？(Harga)"],
    },
    {
      num: "5",
      title: "Daily Life",
      titleChinese: "日常生活",
      desc: "Rutinitas harian, kata kerja penting, dan kaidah waktu sebelum kata kerja.",
      topics: ["Bangun, Tidur, Bekerja", "Pagi, Siang, Malam", "S + Waktu + Verb"],
    },
    {
      num: "6",
      title: "Places & Directions",
      titleChinese: "地点与方向",
      desc: "Tempat penting (toilet, sekolah, RS), menanyakan lokasi (在哪里), dan arah.",
      topics: ["洗手间在哪里？", "Sekolah & RS", "Kiri, Kanan, Depan"],
    },
    {
      num: "7",
      title: "Everyday Conversation",
      titleChinese: "日常会话",
      desc: "Meminta bantuan, menyatakan kesukaan, dan evaluasi akhir komprehensif.",
      topics: ["你可以帮我吗？", "喜欢 (Suka)", "Asesmen Pemula Lengkap"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading & Value Prop */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Didesain Khusus untuk Penutur Bahasa Indonesia</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Kuasai Bahasa Mandarin <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-700">
                    Mulai dari Nol
                  </span>{" "}
                  dengan Percaya Diri.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                  Pelajari Hanzi, Pinyin, 4 nada, dan percakapan nyata melalui kurikulum terstruktur,
                  flashcard berjarak (Spaced Repetition SM-2), latihan interaktif, dan AI Tutor ramah berbahasa Indonesia.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full text-base">
                      <span>Mulai Belajar Sekarang</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>

                  <Link href="/courses" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full text-base">
                      <BookOpen className="w-4 h-4 mr-1 text-teal-700" />
                      <span>Jelajahi 8 Jalur Kurikulum</span>
                    </Button>
                  </Link>
                </div>

                {/* Trust Metrics */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">8 Jalur</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">Kurikulum Pemula</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">100% Asli</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">Hanzi & Pinyin Bernada</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">SM-2</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">Spaced Repetition</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Tone Playground Card */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/40 dark:shadow-black/30 relative">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-teal-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-100">
                        Coba Dengar: Perbedaan 4 Nada
                      </span>
                    </div>
                    <span className="text-xs text-teal-700 dark:text-teal-300 font-mono">mā, má, mǎ, mà</span>
                  </div>

                  {/* Active Card Preview */}
                  <div className="py-8 text-center bg-teal-50/40 dark:bg-slate-800 rounded-2xl my-4 border border-teal-100 dark:border-slate-700">
                    {toneExamples.map((item) => {
                      if (item.tone !== activeTone) return null;
                      return (
                        <div key={item.tone} className="space-y-3">
                          <span className="text-teal-700 dark:text-teal-300 font-mono text-xl font-bold">
                            {item.pinyin}
                          </span>
                          <div className="font-serif text-7xl font-bold text-slate-900 dark:text-white">
                            {item.hanzi}
                          </div>
                          <div className="text-slate-800 dark:text-slate-100 font-semibold text-lg">
                            {item.meaning}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300">
                            Pola Nada: <strong>{item.mark}</strong>
                          </div>
                          <div className="pt-2">
                            <AudioButton
                              text={item.hanzi}
                              size="lg"
                              label="Putar Pengucapan Native"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tone selector buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {toneExamples.map((item) => (
                      <button
                        key={item.tone}
                        type="button"
                        onClick={() => setActiveTone(item.tone)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          activeTone === item.tone
                            ? "bg-teal-700 text-white border-teal-700 font-bold shadow-xs scale-102"
                            : "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                        }`}
                      >
                        <div className="text-xs font-mono">{item.pinyin}</div>
                        <div className="text-sm font-bold font-serif">{item.hanzi}</div>
                        <div className="text-[10px] opacity-75">Nada {item.tone}</div>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-600 text-center mt-4">
                    💡 Satu suku kata &quot;ma&quot; memiliki 4 arti berbeda tergantung tanda nadanya. Di MandarinVerse, Anda akan menguasainya secara alami!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 CORE LEARNING PILLARS */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Pilar Pembelajaran
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Metode Terbukti untuk Penutur Indonesia
              </h2>
              <p className="text-base text-slate-600">
                Bukan sekadar hafalan acak. Kami merancang setiap materi dengan penjelasan perbandingan tata bahasa Indonesia dan Mandarin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 transition-all hover:shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kurikulum Berjenjang</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  8 jalur pembelajaran logis dari pengenalan aksara, sapaan, angka, keluarga, belanja, hingga percakapan lengkap.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 transition-all hover:shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Spaced Repetition (SM-2)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sistem pengulangan cerdas memastikan kosakata yang Anda pelajari masuk ke memori jangka panjang tanpa rasa jenuh.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 transition-all hover:shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audio Suara Asli</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dengarkan pelafalan akurat Mandarin standar (Putonghua) langsung di browser pada setiap kosakata dan kalimat.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 transition-all hover:shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Tutor Bahasa Indonesia</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Tanyakan pertanyaan tata bahasa kapan saja. Tutor AI kami menjawab dengan sabar, hangat, dan mudah dimengerti.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CURRICULUM ROADMAP SECTION */}
        <section className="py-16 md:py-24 bg-[#fbfbfa]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Roadmap Belajar
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
                  8 Jalur Pembelajaran Pemula
                </h2>
                <p className="text-base text-slate-600 mt-1 max-w-xl">
                  Dirancang dari nol agar Anda tidak tersesat atau kewalahan dengan materi yang terlalu rumit di awal.
                </p>
              </div>

              <Link href="/courses">
                <Button variant="outline" className="gap-2">
                  <span>Lihat Semua Detail Pelajaran</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {curriculumPaths.map((c) => (
                <div
                  key={c.num}
                  className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs">
                        P{c.num}
                      </span>
                      <span className="text-xs font-serif text-teal-700 font-semibold">
                        {c.titleChinese}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.desc}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {c.topics.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="truncate">{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <Link
                      href={`/courses/course-path-${c.num}`}
                      className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Mulai Jalur Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 md:py-20 bg-teal-900 text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal-300 bg-teal-800/80 px-4 py-1.5 rounded-full border border-teal-700">
              Gratis & Terbuka untuk Komunitas
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Mulai Perjalanan Mandarin Anda Hari Ini
            </h2>

            <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
              Daftar dalam 30 detik, pilih target harian Anda (mulai dari 10 menit per hari), dan rasakan kemajuan nyata setiap sesi belajar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-white text-teal-900 hover:bg-teal-50 w-full text-base font-bold shadow-md"
                >
                  Daftar Sekarang (Gratis)
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-teal-300 text-white hover:bg-teal-800 hover:border-teal-200 w-full text-base"
                >
                  Sudah Punya Akun? Masuk
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
