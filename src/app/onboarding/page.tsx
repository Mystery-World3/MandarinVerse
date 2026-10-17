"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Plane,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // User preferences
  const [goal, setGoal] = useState("Percakapan Harian & Traveling");
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [level, setLevel] = useState("Benar-benar Nol (Beginner 0)");
  const [isSaving, setIsSaving] = useState(false);

  const goalOptions = [
    {
      id: "daily",
      title: "Percakapan Harian & Traveling",
      desc: "Menyapa, memesan makanan, berbelanja, dan liburan ke Tiongkok/Taiwan.",
      icon: Plane,
    },
    {
      id: "career",
      title: "Peluang Karir & Bisnis",
      desc: "Meningkatkan CV, komunikasi dengan klien/rekan kerja berbahasa Mandarin.",
      icon: Briefcase,
    },
    {
      id: "study",
      title: "Studi & Beasiswa HSK",
      desc: "Mempersiapkan tes HSK 1-3 dan fondasi bahasa untuk kuliah.",
      icon: BookOpen,
    },
    {
      id: "culture",
      title: "Hobi & Ketertarikan Budaya",
      desc: "Menonton drama C-Drama, mendengarkan lagu, dan memahami aksara Hanzi.",
      icon: Sparkles,
    },
  ];

  const targetOptions = [
    { minutes: 5, label: "Santai", desc: "5 menit / hari (1 pelajaran singkat)" },
    { minutes: 10, label: "Reguler", desc: "10 menit / hari (standar ideal)" },
    { minutes: 15, label: "Fokus", desc: "15 menit / hari (kemajuan cepat)" },
    { minutes: 20, label: "Intensif", desc: "20 menit / hari (komitmen penuh)" },
  ];

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Save preferences to local store or API
      localStorage.setItem(
        "mv_preferences",
        JSON.stringify({ goal, dailyMinutes, level, completedAt: new Date().toISOString() })
      );
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Steps Progress bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span className="font-semibold text-teal-800 uppercase tracking-wider">
            Langkah {step} dari 3
          </span>
          <div className="flex gap-1.5">
            <span
              className={`w-8 h-1.5 rounded-full ${
                step >= 1 ? "bg-teal-700" : "bg-slate-200"
              }`}
            />
            <span
              className={`w-8 h-1.5 rounded-full ${
                step >= 2 ? "bg-teal-700" : "bg-slate-200"
              }`}
            />
            <span
              className={`w-8 h-1.5 rounded-full ${
                step >= 3 ? "bg-teal-700" : "bg-slate-200"
              }`}
            />
          </div>
        </div>

        {/* Step 1: Goal Selection */}
        {step === 1 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Apa tujuan utama Anda belajar Mandarin?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Kami akan menyesuaikan rekomendasi kurikulum Anda sesuai tujuan ini.
              </p>
            </div>

            <div className="space-y-3">
              {goalOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = goal === opt.title;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(opt.title)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? "border-teal-700 bg-teal-50/60 ring-2 ring-teal-500 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-900">{opt.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-teal-700 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                Lewati pertanyaan ini
              </button>
              <Button variant="primary" onClick={() => setStep(2)}>
                Lanjut
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Target Harian */}
        {step === 2 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Berapa menit Anda ingin belajar setiap hari?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Kunci belajar bahasa adalah konsistensi harian, bukan belajar lama namun jarang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetOptions.map((opt) => {
                const isSelected = dailyMinutes === opt.minutes;
                return (
                  <button
                    key={opt.minutes}
                    type="button"
                    onClick={() => setDailyMinutes(opt.minutes)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-teal-700 bg-teal-50/60 ring-2 ring-teal-500 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">{opt.label}</span>
                      <Clock
                        className={`w-4 h-4 ${isSelected ? "text-teal-700" : "text-slate-600"}`}
                      />
                    </div>
                    <span className="text-xs text-slate-600 mt-2">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Kembali
              </Button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Lanjut ke Panduan Dasar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pengenalan Hanzi, Pinyin & Nada */}
        {step === 3 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Fondasi Utama
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
                3 Pilar Utama Bahasa Mandarin
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Pahami ini sebelum mulai: Hanzi adalah aksara, Pinyin adalah ejaan, dan Nada menentukan arti!
              </p>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <span className="font-serif font-bold text-lg text-teal-800 shrink-0">字</span>
                <div>
                  <h4 className="font-bold text-slate-900">1. Hanzi (Aksara Mandarin)</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Karakter tulisan berupa piktograf dan ideograf. Contoh: 人 (orang), 山 (gunung).
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <span className="font-mono font-bold text-base text-teal-800 shrink-0">Pīn</span>
                <div>
                  <h4 className="font-bold text-slate-900">2. Hanyu Pinyin (Ejaan Latin)</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Jembatan huruf latin untuk membaca cara melafalkan Hanzi dengan benar.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                <span className="font-mono font-bold text-base text-teal-800 shrink-0">ā á</span>
                <div>
                  <h4 className="font-bold text-slate-900">3. Empat Nada (Shēngdiào)</h4>
                  <p className="text-slate-600 text-xs mt-0.5">
                    Perubahan intonasi mengubah makna kata: Nada 1 (datar), Nada 2 (naik), Nada 3 (rendah), Nada 4 (hentak).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                Kembali
              </Button>
              <Button
                variant="primary"
                onClick={handleFinish}
                isLoading={isSaving}
                className="gap-2"
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
