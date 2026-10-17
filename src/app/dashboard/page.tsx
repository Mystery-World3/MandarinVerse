"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Layers,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import { UserDashboardData } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/user/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600">Memuat data pembelajaran Anda...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const user = data?.user;
  const streak = data?.streakDays || 0;
  const xp = data?.totalXp || 0;
  const completedLessons = data?.completedLessonsCount || 0;
  const totalLessons = data?.totalLessonsCount || 10;
  const learnedVocab = data?.learnedVocabularyCount || 0;
  const dueReviews = data?.dueReviewsCount || 0;
  const nextLesson = data?.nextRecommendedLesson;
  const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang, {user?.name || "Pembelajar"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Target: <span className="font-semibold text-teal-800">{user?.goal || "Percakapan Harian"}</span> •{" "}
              {user?.dailyTargetMinutes || 10} menit per hari
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real Streak Indicator */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/90 px-3.5 py-1.5 rounded-2xl">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div className="text-left">
                <div className="text-xs font-bold text-amber-900 leading-none">{streak} Hari</div>
                <div className="text-[10px] text-amber-700 font-medium">Streak Belajar</div>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-200/90 px-3.5 py-1.5 rounded-2xl">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div className="text-left">
                <div className="text-xs font-bold text-teal-900 leading-none">{xp} XP</div>
                <div className="text-[10px] text-teal-700 font-medium">Total Poin</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOP CALLOUT: Continue Learning / Recommended Next Lesson */}
        {nextLesson ? (
          <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-700/60 px-3 py-1 rounded-full border border-teal-600/40">
                Lanjutkan Pelajaran Anda
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {nextLesson.title}
              </h2>
              <p className="text-teal-200 text-sm font-serif">{nextLesson.titleChinese}</p>
              <p className="text-teal-100 text-xs">Jalur: {nextLesson.pathName}</p>
            </div>

            <Link href={`/courses/${nextLesson.courseId}/lessons/${nextLesson.lessonId}`}>
              <Button
                size="lg"
                className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm shadow-sm gap-2"
              >
                <span>Mulai Belajar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-700 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">
              Luar Biasa! Semua Pelajaran Terselesaikan!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Anda telah menuntaskan seluruh pelajaran dasar kurikulum. Lakukan review kosakata harian untuk menjaga ingatan jangka panjang!
            </p>
          </div>
        )}

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Completed Lessons */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Pelajaran Selesai</span>
              <BookOpen className="w-4 h-4 text-teal-700" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {completedLessons}{" "}
              <span className="text-xs font-normal text-slate-600">/ {totalLessons}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-700 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Learned Vocabulary */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Kosakata Dipelajari</span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{learnedVocab}</div>
            <p className="text-[11px] text-slate-600">Tersimpan di deck SRS</p>
          </div>

          {/* Due Reviews SRS */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Review Hari Ini</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{dueReviews}</div>
            {dueReviews > 0 ? (
              <Link
                href="/vocabulary/review"
                className="text-[11px] font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Review Sekarang</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            ) : (
              <p className="text-[11px] text-slate-600">Semua jadwal tuntas!</p>
            )}
          </div>

          {/* Quiz Average */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Rata-rata Kuis</span>
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.averageQuizScore || 0}%
            </div>
            <p className="text-[11px] text-slate-600">Dari hasil evaluasi asli</p>
          </div>
        </div>

        {/* QUICK SHORTCUTS & ACHIEVEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Quick Learning Actions */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Akses Cepat Belajar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link
                href="/courses"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Semua Jalur Belajar</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Pilih pelajaran dari Jalur 0 sampai Jalur 7.
                  </p>
                </div>
              </Link>

              <Link
                href="/vocabulary/review"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Spaced Repetition (SRS)</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Uji ingatan flashcard berjarak ({dueReviews} kata siap).
                  </p>
                </div>
              </Link>

              <Link
                href="/vocabulary"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Kamus Kosakata Saya</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Lihat daftar kosakata lengkap dengan pelafalan audio.
                  </p>
                </div>
              </Link>

              <Link
                href="/tutor"
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Tanya AI Tutor</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Konsultasikan tata bahasa atau pelafalan nada.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Pencapaian</h3>
              <Link href="/progress" className="text-xs font-semibold text-teal-700 hover:underline">
                Lihat Semua
              </Link>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 space-y-3">
              {(data?.achievements || []).slice(0, 3).map(({ achievement, unlocked }) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    unlocked
                      ? "bg-amber-50/50 border-amber-200"
                      : "bg-slate-50 border-slate-200/80 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        unlocked
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{achievement.title}</h5>
                      <p className="text-[10px] text-slate-600 line-clamp-1">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800 shrink-0">
                    +{achievement.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
