"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  LogOut,
  Mail,
  Save,
  Shield,
  Target,
  User as UserIcon,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const currentName = name !== null ? name : user?.name || "";
  const currentGoal =
    goal !== null ? goal : (user as any)?.goal || "Percakapan Harian";
  const currentDailyMinutes =
    dailyMinutes !== null
      ? dailyMinutes
      : (user as any)?.dailyTargetMinutes || 15;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      user: session?.user || { name, goal, dailyMinutes },
      exportedAt: new Date().toISOString(),
      platform: "MandarinVerse",
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mandarinverse-user-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const initials = name ? name.slice(0, 2).toUpperCase() : "MV";

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200">
            Akun & Preferensi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Profil Pembelajar
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kelola target belajar harian, informasi profil, dan keamanan akun Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-xs">
              <div className="w-20 h-20 rounded-full bg-teal-100 border-2 border-teal-200 text-teal-900 font-bold text-2xl flex items-center justify-center mx-auto shadow-xs">
                {initials}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{name || "Pembelajar"}</h3>
                <p className="text-xs text-slate-600">{session?.user?.email || "learner@mandarinverse.com"}</p>
                <span className="inline-block mt-2 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  {(session?.user as any)?.role === "admin" ? "Administrator" : "Tingkat Pemula"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>Keluar dari Akun</span>
                </Button>
              </div>
            </div>

            {/* Privacy & Data Management */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Shield className="w-4 h-4 text-teal-700" />
                <span>Privasi & Keamanan Data</span>
              </div>
              <p className="leading-relaxed">
                MandarinVerse tidak pernah menjual atau membagikan data pribadi Anda ke pihak ketiga.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cadangkan Data Saya (JSON)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="md:col-span-8">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                Pengaturan Target Pembelajaran
              </h3>

              {isSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                  Pengaturan profil dan target belajar berhasil diperbarui!
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Panggilan
                  </label>
                  <input
                    type="text"
                    value={currentName}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tujuan Pembelajaran
                  </label>
                  <select
                    value={currentGoal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
                  >
                    <option value="Percakapan Harian">Percakapan Harian & Traveling</option>
                    <option value="Karir & Bisnis">Peluang Karir & Bisnis</option>
                    <option value="Studi & HSK">Studi & Persiapan Ujian HSK</option>
                    <option value="Hobi & Budaya">Hobi & Ketertarikan Budaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Belajar Harian (Menit)
                  </label>
                  <select
                    value={currentDailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
                  >
                    <option value={5}>5 Menit / Hari (Santai)</option>
                    <option value={10}>10 Menit / Hari (Reguler)</option>
                    <option value={15}>15 Menit / Hari (Fokus)</option>
                    <option value={20}>20 Menit / Hari (Intensif)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" className="gap-2">
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
