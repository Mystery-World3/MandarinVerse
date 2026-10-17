"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Filter,
  Layers,
  Search,
  Sparkles,
  Volume2,
} from "lucide-react";
import { UserVocabulary } from "@/lib/types";
import { AudioButton } from "@/components/learning/AudioButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function VocabularyListPage() {
  const [vocabList, setVocabList] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    async function loadVocab() {
      try {
        const res = await fetch("/api/vocabulary");
        const data = await res.json();
        if (data.success) {
          setVocabList(data.vocabulary);
          const now = Date.now();
          const due = data.vocabulary.filter(
            (v: any) => !v.nextReviewDate || new Date(v.nextReviewDate).getTime() <= now
          ).length;
          setDueCount(due);
        }
      } catch (err) {
        console.error("Failed to load vocabulary:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVocab();
  }, []);

  const filtered = vocabList.filter((item) => {
    const v = item.vocabulary;
    if (!v) return false;

    const matchesSearch =
      v.hanzi.includes(search) ||
      v.pinyin.toLowerCase().includes(search.toLowerCase()) ||
      v.indonesian.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.reviewStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Header & SRS Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200">
              Kamus Pribadi Anda
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Koleksi Kosakata ({vocabList.length} Kata)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Semua kosakata yang Anda selesaikan dari pelajaran otomatis tersimpan di sini.
            </p>
          </div>

          <Link href="/vocabulary/review">
            <Button variant="primary" size="lg" className="gap-2 shadow-sm font-bold">
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Review SRS Hari Ini ({dueCount} Kata)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Hanzi, Pinyin, atau arti..."
              className="w-full px-3.5 py-2 pl-9 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <span className="text-xs text-slate-600 font-medium mr-1 hidden sm:inline">Filter:</span>
            {["all", "new", "learning", "review", "mastered"].map((st) => {
              const labels: Record<string, string> = {
                all: "Semua",
                new: "Baru",
                learning: "Belajar",
                review: "Review",
                mastered: "Dikuasai",
              };
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {labels[st]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-600">Memuat kosakata...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Belum ada kosakata tersimpan</h3>
            <p className="text-xs text-slate-600">
              Mulai dan selesaikan pelajaran di Jalur Belajar untuk menambahkan kosakata ke kamus pribadi Anda.
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm">Buka Jalur Belajar</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const v = item.vocabulary!;
              const statusBadges: Record<string, { label: string; color: string }> = {
                new: { label: "Baru", color: "bg-slate-100 text-slate-700 border-slate-200" },
                learning: { label: "Belajar", color: "bg-amber-50 text-amber-800 border-amber-200" },
                review: { label: "Review", color: "bg-teal-50 text-teal-800 border-teal-200" },
                mastered: { label: "Dikuasai", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
              };
              const badge = statusBadges[item.reviewStatus] || statusBadges.learning;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl font-bold text-slate-900">
                          {v.hanzi}
                        </span>
                        <span className="font-mono text-sm font-bold text-teal-700">
                          {v.pinyin}
                        </span>
                      </div>
                      <AudioButton text={v.hanzi} size="sm" />
                    </div>

                    <div className="text-sm font-semibold text-slate-900 leading-snug">
                      {v.indonesian}
                    </div>

                    {v.exampleChinese && (
                      <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                        <div className="text-slate-900 font-medium">{v.exampleChinese}</div>
                        <div className="text-slate-600 text-[11px]">{v.exampleIndonesian}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                    <span className={`px-2 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span>Repetisi: {item.repetitions}x</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
