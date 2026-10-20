"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, RotateCw, Sparkles, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { ReviewGrade, UserVocabulary, VocabularyItem } from "@/lib/types";
import { AudioButton } from "./AudioButton";
import { Button } from "../ui/Button";

interface FlashcardDeckProps {
  items: UserVocabulary[];
  onReviewSubmit: (vocabularyId: string, grade: ReviewGrade) => Promise<void>;
}

export function FlashcardDeck({ items, onReviewSubmit }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [reviewError, setReviewError] = useState("");

  const currentItem = items[currentIndex];
  const vocab: VocabularyItem | undefined = currentItem?.vocabulary;

  const handleRate = async (grade: ReviewGrade) => {
    if (!currentItem || isSubmitting) return;

    setIsSubmitting(true);
    setReviewError("");
    try {
      await onReviewSubmit(currentItem.vocabularyId, grade);
      setReviewedCount((prev) => prev + 1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);

      if (currentIndex + 1 >= items.length) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Review gagal disimpan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut support: Space to flip, 1/2/3/4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped && !isSubmitting) {
        if (e.key === "1") handleRate("again");
        if (e.key === "2") handleRate("hard");
        if (e.key === "3") handleRate("good");
        if (e.key === "4") handleRate("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, isSubmitting, currentIndex, handleRate]);

  // Completed State
  if (items.length === 0 || currentIndex >= items.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Semua Kosakata Telah Direview!</h3>
        <p className="text-slate-600 text-sm mb-6">
          Luar biasa! Anda telah menyelesaikan review {reviewedCount} kata hari ini menggunakan algoritma Spaced Repetition (SM-2).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => (window.location.href = "/dashboard")}>
            Kembali ke Dashboard
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/courses")}>
            Lanjut Pelajaran Baru
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <span>
          Kartu {currentIndex + 1} dari {items.length}
        </span>
        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-700 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[340px] sm:min-h-[380px] bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative group select-none"
      >
        {/* Top bar on card */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
            {vocab?.partOfSpeech || "Kata"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 hidden sm:inline">Klik atau Spasi untuk balik</span>
            <RotateCw className="w-4 h-4 text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
          </div>
        </div>

        {/* Card Center Content */}
        {!isFlipped ? (
          // Front of Card: Hanzi + Audio
          <div className="my-auto text-center py-6">
            <div className="font-serif text-6xl sm:text-7xl font-bold text-slate-900 tracking-wide mb-4">
              {vocab?.hanzi}
            </div>
            <div className="flex items-center justify-center gap-2">
              <AudioButton text={vocab?.hanzi || ""} size="md" label="Dengarkan pengucapan" />
            </div>
          </div>
        ) : (
          // Back of Card: Pinyin + Meaning + Example + Mnemonic
          <div className="my-auto text-center py-4 space-y-4">
            <div>
              <span className="font-mono text-2xl font-bold text-teal-700 tracking-wide">
                {vocab?.pinyin}
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {vocab?.indonesian}
              </h4>
            </div>

            {/* Example sentence */}
            {vocab?.exampleChinese && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{vocab.exampleChinese}</span>
                  <AudioButton text={vocab.exampleChinese} size="sm" />
                </div>
                <div className="text-teal-700 font-mono text-[11px] mt-0.5">
                  {vocab.examplePinyin}
                </div>
                <div className="text-slate-600 mt-0.5">{vocab.exampleIndonesian}</div>
              </div>
            )}

            {/* Mnemonic */}
            {vocab?.mnemonic && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl">
                💡 <strong>Tips Menghafal:</strong> {vocab.mnemonic}
              </p>
            )}
          </div>
        )}

        {/* Bottom hint */}
        <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          {!isFlipped ? (
            <span>Ketuk kartu untuk melihat arti & pinyin</span>
          ) : (
            <span>Seberapa baik ingatan Anda terhadap kata ini?</span>
          )}
        </div>
      </div>

      {reviewError && (
        <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {reviewError}
        </p>
      )}

      {/* Rating Buttons (Revealed when card is flipped) */}
      {isFlipped && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleRate("again")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-bold">Lupa</span>
            <span className="text-[10px] text-rose-600 mt-0.5">Ulangi (1 hari) [1]</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleRate("hard")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-bold">Sulit</span>
            <span className="text-[10px] text-amber-600 mt-0.5">Sedikit ingat [2]</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleRate("good")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-bold">Baik</span>
            <span className="text-[10px] text-teal-600 mt-0.5">Ingat lancar [3]</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleRate("easy")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all active:scale-95 cursor-pointer"
          >
            <span className="text-sm font-bold">Mudah</span>
            <span className="text-[10px] text-emerald-600 mt-0.5">Sangat hafal [4]</span>
          </button>
        </div>
      )}
    </div>
  );
}
