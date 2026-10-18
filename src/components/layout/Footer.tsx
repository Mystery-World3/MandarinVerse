import React from "react";
import Link from "next/link";
import { BookOpen, Heart, Shield, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center text-white font-serif font-bold text-base">
                华
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                Mandarin<span className="text-teal-700 dark:text-teal-300">Verse</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
              Platform pembelajaran bahasa Mandarin terstruktur dari nol untuk penutur bahasa Indonesia.
              Kuasai Hanzi, Pinyin, 4 nada, dan percakapan nyata secara percaya diri.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <span>Dibangun dengan semangat edukasi</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>untuk pembelajar mandiri Indonesia.</span>
            </div>
          </div>

          {/* Kurikulum */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Jalur Belajar
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/courses" className="hover:text-teal-300 transition-colors">
                  Mandarin Foundations (Nada & Hanzi)
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-teal-300 transition-colors">
                  Salam & Perkenalan Diri
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-teal-300 transition-colors">
                  Angka, Kalender & Waktu
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-teal-300 transition-colors">
                  Keluarga, Makanan & Belanja
                </Link>
              </li>
            </ul>
          </div>

          {/* Fitur & Bantuan */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Fitur Pembelajaran
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/vocabulary/review" className="hover:text-teal-300 transition-colors">
                  Spaced Repetition (SRS Flashcards)
                </Link>
              </li>
              <li>
                <Link href="/tutor" className="hover:text-teal-300 transition-colors">
                  AI Mandarin Tutor
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-teal-300 transition-colors">
                  Statistik & Pencapaian
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-teal-300 transition-colors">
                  Pengaturan & Privasi Data
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 MandarinVerse. Belajar Mandarin dari Nol.</p>
          <div className="flex items-center gap-6">
            <span>Standar Hanyu Pinyin & Hanzi Sederhana</span>
            <span>Aman & Terenkripsi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
