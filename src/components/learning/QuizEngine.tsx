"use client";

import React, { useState } from "react";
import { CheckCircle, HelpCircle, RotateCcw, Trophy, XCircle, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Quiz, QuizQuestion } from "@/lib/types";
import { AudioButton } from "./AudioButton";
import { SentenceBuilder } from "./SentenceBuilder";
import { Button } from "../ui/Button";

interface QuizEngineProps {
  quiz: Quiz;
  onComplete?: (score: number, maxScore: number, isPassed: boolean) => void;
}

export function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any | null>(null);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSentenceChange = (questionId: string, wordIds: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: wordIds }));
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (data.success) {
        setQuizResult(data);
        if (data.attempt.isPassed) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        }
        if (onComplete) {
          onComplete(data.attempt.score, data.attempt.maxScore, data.attempt.isPassed);
        }
      } else {
        alert(data.error || "Gagal mengirim kuis.");
      }
    } catch (err: any) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setQuizResult(null);
    setCurrentQuestionIndex(0);
  };

  // Result Screen
  if (quizResult) {
    const { attempt, questionResults } = quizResult;
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-sm space-y-8">
        <div className="text-center space-y-3">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${
              attempt.isPassed
                ? "bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {attempt.isPassed ? "Selamat! Anda Lulus Evaluasi 🎉" : "Terus Berlatih, Anda Pasti Bisa!"}
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            {attempt.isPassed
              ? `Skor Anda ${attempt.score} dari ${attempt.maxScore} pertanyaan (${attempt.percentage}%). Anda telah menguasai materi ini dengan baik!`
              : `Skor Anda ${attempt.score} dari ${attempt.maxScore} (${attempt.percentage}%). Nilai kelulusan minimum adalah ${quiz.passingScore}%.`}
          </p>

          <div className="inline-flex items-center gap-4 bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl">
            <div className="text-center">
              <div className="text-xs text-slate-600">Skor Anda</div>
              <div className="text-2xl font-bold text-slate-900">{attempt.percentage}%</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xs text-slate-600">Status</div>
              <div
                className={`text-sm font-bold ${
                  attempt.isPassed ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {attempt.isPassed ? "LULUS" : "BELUM LULUS"}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Review & Explanations */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Pembahasan Jawaban & Penjelasan
          </h3>
          <div className="space-y-3">
            {questionResults.map((r: any, idx: number) => {
              const originalQ = questions.find((q) => q.id === r.questionId);
              return (
                <div
                  key={r.questionId}
                  className={`p-4 rounded-2xl border text-sm transition-all ${
                    r.isCorrect
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-rose-50/50 border-rose-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-semibold text-slate-900">
                      Pertanyaan {idx + 1}: {originalQ?.prompt}
                    </span>
                    {r.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" /> Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3.5 h-3.5" /> Salah
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60 mt-2">
                    💡 <strong>Penjelasan:</strong> {r.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="outline" onClick={handleRetry} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Ulangi Kuis
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = "/courses")}>
            Lanjut ke Jalur Belajar
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center py-12 text-slate-600">Kuis ini belum memiliki soal.</div>;
  }

  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCurrentAnswered =
    currentQuestion.type === "sentence_arrange"
      ? Array.isArray(currentAnswer) && currentAnswer.length > 0
      : Boolean(currentAnswer);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-sm space-y-6">
      {/* Quiz Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider text-[11px]">
            {quiz.title}
          </span>
          <span>
            Soal {currentQuestionIndex + 1} dari {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-700 h-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="py-2 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQuestion.prompt}
          </h3>
          {currentQuestion.promptPinyin && (
            <AudioButton text={currentQuestion.promptPinyin} size="md" />
          )}
        </div>
        {currentQuestion.promptPinyin && (
          <p className="text-teal-700 font-mono text-sm">{currentQuestion.promptPinyin}</p>
        )}
      </div>

      {/* Question Interaction Area */}
      <div className="py-2">
        {currentQuestion.type === "sentence_arrange" ? (
          <SentenceBuilder
            options={currentQuestion.options}
            onChange={(selectedIds) => handleSentenceChange(currentQuestion.id, selectedIds)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = currentAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? "border-teal-700 bg-teal-50/70 ring-2 ring-teal-500 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-base font-semibold text-slate-900">{opt.text}</span>
                  {opt.pinyin && (
                    <span className="text-xs text-teal-700 font-mono">{opt.pinyin}</span>
                  )}
                  {opt.meaning && (
                    <span className="text-xs text-slate-600">{opt.meaning}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation & Submit footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Sebelumnya
        </Button>

        {isLastQuestion ? (
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!isCurrentAnswered || isSubmitting}
          >
            Selesai & Kumpulkan Jawaban
          </Button>
        ) : (
          <Button variant="primary" onClick={handleNext} disabled={!isCurrentAnswered}>
            Lanjut Soal Berikutnya
          </Button>
        )}
      </div>
    </div>
  );
}
