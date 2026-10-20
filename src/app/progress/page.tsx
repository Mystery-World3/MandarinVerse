"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Layers,
  Sparkles,
  Trophy,
} from "lucide-react";
import { UserDashboardData } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ProgressPage() {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/user/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const achievements = data?.achievements || [];
  const activities = data?.recentActivity || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200">
            Riwayat Pembelajaran
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Kemajuan & Lencana Pencapaian
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Statistik asli dihitung dari aktivitas penyelesaian pelajaran, hasil kuis evaluasi, dan review kosakata Anda.
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-semibold">Streak Saat Ini</span>
            <div className="text-3xl font-extrabold text-amber-600 flex items-center gap-1.5">
              <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
              <span>{data?.streakDays || 0}</span>
              <span className="text-xs font-normal text-slate-600">Hari</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-semibold">Total Poin (XP)</span>
            <div className="text-3xl font-extrabold text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-6 h-6 text-teal-600" />
              <span>{data?.totalXp || 0}</span>
              <span className="text-xs font-normal text-slate-600">XP</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-semibold">Pelajaran Tuntas</span>
            <div className="text-3xl font-extrabold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-6 h-6 text-teal-700" />
              <span>{data?.completedLessonsCount || 0}</span>
              <span className="text-xs font-normal text-slate-600">/ {data?.totalLessonsCount || 10}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-1">
            <span className="text-xs text-slate-600 font-semibold">Rata-rata Skor Kuis</span>
            <div className="text-3xl font-extrabold text-emerald-700 flex items-center gap-1.5">
              <Trophy className="w-6 h-6 text-emerald-600" />
              <span>{data?.averageQuizScore || 0}%</span>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Lencana Pencapaian ({achievements.filter((a) => a.unlocked).length} dari {achievements.length} Terbuka)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(({ achievement, unlocked }) => (
              <div
                key={achievement.id}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  unlocked
                    ? "bg-white border-amber-200/90 shadow-xs"
                    : "bg-slate-50 border-slate-200/70 opacity-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    unlocked
                      ? "bg-amber-100 text-amber-800 shadow-xs"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Award className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{achievement.title}</h4>
                    {unlocked && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Terbuka
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-serif text-teal-800 font-semibold block">
                    {achievement.titleChinese}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {achievement.description}
                  </p>
                  <span className="text-[11px] font-bold text-amber-700 block pt-1">
                    +{achievement.xpReward} XP Reward
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITIES TABLE */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Aktivitas Pembelajaran Terakhir
          </h2>

          {activities.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-600">
              Belum ada log aktivitas. Selesaikan pelajaran atau kuis untuk mulai mencatat riwayat belajar Anda.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Tanggal &amp; Waktu</th>
                      <th className="px-6 py-3.5">Waktu Belajar</th>
                      <th className="px-6 py-3.5">Pelajaran Selesai</th>
                      <th className="px-6 py-3.5">Kuis Diambil</th>
                      <th className="px-6 py-3.5 text-right">XP Diperoleh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                          {new Date(act.timestamp || act.createdAt || act.date).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="px-6 py-4">{act.minutesSpent} menit</td>
                        <td className="px-6 py-4">{act.lessonsCompleted}</td>
                        <td className="px-6 py-4">{act.quizzesTaken}</td>
                        <td className="px-6 py-4 text-right font-bold text-teal-800">
                          +{act.xpGained} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
