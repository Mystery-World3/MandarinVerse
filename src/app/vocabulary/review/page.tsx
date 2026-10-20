"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { ReviewGrade, UserVocabulary } from "@/lib/types";
import { FlashcardDeck } from "@/components/learning/FlashcardDeck";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function VocabularyReviewPage() {
  const [items, setItems] = useState<UserVocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch("/api/vocabulary");
        const data = await res.json();
        if (data.success) {
          // Filter items due for review or include all saved words if learner wants to practice
          const allVocab: UserVocabulary[] = data.vocabulary;
          const dueVocab = allVocab.filter(
            (v) => !v.nextReviewDate || new Date(v.nextReviewDate).getTime() <= Date.now()
          );

          // If no words are strictly due, provide the saved words so learner can still practice!
          setItems(dueVocab.length > 0 ? dueVocab : allVocab);
        }
      } catch (err) {
        console.error("Failed to load review items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const handleReviewSubmit = async (vocabularyId: string, grade: ReviewGrade) => {
    const res = await fetch("/api/vocabulary/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabularyId, grade }),
    });
    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.success) {
      throw new Error(result?.error || "Review gagal disimpan ke database. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-1.5 font-semibold hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Koleksi Kosakata</span>
          </Link>
          <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px]">
            Spaced Repetition (SM-2)
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600">Mempersiapkan kartu memori Anda...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Belum Ada Kata untuk Direview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Selesaikan pelajaran di Jalur Belajar untuk mengumpulkan kosakata ke dalam deck review harian Anda.
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm">Buka Jalur Belajar</Button>
            </Link>
          </div>
        ) : (
          <FlashcardDeck items={items} onReviewSubmit={handleReviewSubmit} />
        )}
      </main>

      <Footer />
    </div>
  );
}
