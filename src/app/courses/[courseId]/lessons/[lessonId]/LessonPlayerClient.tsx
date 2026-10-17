"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  MessageSquare,
  Sparkles,
  Trophy,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Lesson, Course } from "@/lib/types";
import { AudioButton } from "@/components/learning/AudioButton";
import { PinyinViewer } from "@/components/learning/PinyinViewer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

interface LessonPlayerClientProps {
  courseId: string;
  lessonId: string;
}

export default function LessonPlayerClient({ courseId, lessonId }: LessonPlayerClientProps) {
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"intro" | "hanzi" | "vocab" | "grammar" | "dialogue" | "summary">("intro");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        const data = await res.json();
        if (data.success) {
          setLesson(data.lesson);
          setCourse(data.course);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
      } finally {
        setLoading(false);
      }
    }
    if (lessonId) loadLesson();
  }, [lessonId]);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeSpentSeconds: Math.max(timeSpent, 60) }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setIsCompleting(false);
    }
  };

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

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Pelajaran tidak ditemukan</h2>
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline">Kembali ke Silabus</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const content = lesson.content;

  const tabs = [
    { id: "intro", label: "Pengantar & Tujuan" },
    ...(content.hanziFocus && content.hanziFocus.length > 0
      ? [{ id: "hanzi", label: "Aksara & Bunyi" }]
      : []),
    { id: "vocab", label: `Kosakata (${content.vocabulary.length})` },
    ...(content.grammar && content.grammar.length > 0
      ? [{ id: "grammar", label: "Tata Bahasa" }]
      : []),
    ...(content.dialogue && content.dialogue.length > 0
      ? [{ id: "dialogue", label: "Percakapan" }]
      : []),
    { id: "summary", label: "Selesai & Evaluasi" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 font-semibold hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Silabus</span>
          </Link>

          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
          </span>
        </div>

        {/* Lesson Header Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {course?.title || "MandarinVerse"}
            </span>
            <span className="font-serif text-teal-800 text-base font-bold">
              {lesson.titleChinese}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lesson.description}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-200/80 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: INTRO & OBJECTIVES */}
        {activeTab === "intro" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Pengantar Pelajaran
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {content.introduction}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Target & Capaian Belajar:
              </h3>
              <div className="space-y-2">
                {content.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-teal-50/50 border border-teal-100 text-xs sm:text-sm text-teal-900 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {content.culturalNote && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Wawasan Budaya & Pelafalan
                </span>
                <p className="leading-relaxed">{content.culturalNote}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() =>
                  setActiveTab(content.hanziFocus && content.hanziFocus.length > 0 ? "hanzi" : "vocab")
                }
                className="gap-2"
              >
                <span>Lanjut ke Materi</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: HANZI & SOUND FOCUS */}
        {activeTab === "hanzi" && content.hanziFocus && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Fokus Karakter & Pelafalan
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Klik tombol suara untuk mendengarkan pengucapan native Mandarin yang akurat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.hanziFocus.map((hf, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-teal-700 font-mono text-base font-bold">
                        {hf.pinyin}
                      </span>
                      <div className="font-serif text-5xl font-bold text-slate-900 my-1">
                        {hf.character}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{hf.meaning}</span>
                    </div>

                    <AudioButton text={hf.character} size="md" />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/70 pt-2">
                    {hf.explanation}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setActiveTab("intro")}>
                Kembali
              </Button>
              <Button variant="primary" onClick={() => setActiveTab("vocab")} className="gap-2">
                <span>Pelajari Kosakata</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 3: VOCABULARY LIST */}
        {activeTab === "vocab" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Daftar Kosakata Baru ({content.vocabulary.length} Kata)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Kosakata ini otomatis disimpan ke deck Flashcard Spaced Repetition (SRS) Anda setelah pelajaran selesai.
              </p>
            </div>

            <div className="space-y-3">
              {content.vocabulary.map((vocab) => (
                <div
                  key={vocab.id}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-teal-50/30 border border-slate-200 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-2xl font-bold text-slate-900">
                        {vocab.hanzi}
                      </span>
                      <span className="text-sm font-mono font-bold text-teal-700">
                        {vocab.pinyin}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-semibold">
                        {vocab.partOfSpeech}
                      </span>
                    </div>

                    <AudioButton text={vocab.hanzi} size="sm" />
                  </div>

                  <div className="text-sm font-semibold text-slate-900">
                    {vocab.indonesian}
                  </div>

                  {vocab.exampleChinese && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{vocab.exampleChinese}</span>
                        <AudioButton text={vocab.exampleChinese} size="sm" />
                      </div>
                      <div className="text-teal-700 font-mono text-[11px]">{vocab.examplePinyin}</div>
                      <div className="text-slate-600">{vocab.exampleIndonesian}</div>
                    </div>
                  )}

                  {vocab.mnemonic && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                      💡 <strong>Mnemonic:</strong> {vocab.mnemonic}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() =>
                  setActiveTab(content.hanziFocus && content.hanziFocus.length > 0 ? "hanzi" : "intro")
                }
              >
                Kembali
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  setActiveTab(content.grammar && content.grammar.length > 0 ? "grammar" : "summary")
                }
                className="gap-2"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: GRAMMAR & RULES */}
        {activeTab === "grammar" && content.grammar && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Tata Bahasa & Pola Kalimat
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Perbandingan pola kalimat Mandarin dengan bahasa Indonesia.
              </p>
            </div>

            <div className="space-y-4">
              {content.grammar.map((g, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-teal-700 text-white flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    {g.title}
                  </h4>

                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl font-mono text-xs text-teal-900 font-bold">
                    Pola: {g.pattern}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {g.explanation}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Contoh Kalimat:
                    </span>
                    {g.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{ex.chinese}</span>
                          <AudioButton text={ex.chinese} size="sm" />
                        </div>
                        <div className="text-teal-700 font-mono text-[11px]">{ex.pinyin}</div>
                        <div className="text-slate-600">{ex.indonesian}</div>
                        {ex.breakdown && (
                          <div className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
                            🔍 {ex.breakdown}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setActiveTab("vocab")}>
                Kembali
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  setActiveTab(content.dialogue && content.dialogue.length > 0 ? "dialogue" : "summary")
                }
                className="gap-2"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 5: DIALOGUE */}
        {activeTab === "dialogue" && content.dialogue && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Percakapan Nyata Sehari-hari
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Dengarkan dan ikuti dialog di bawah secara bergantian.
              </p>
            </div>

            <div className="space-y-3">
              {content.dialogue.map((d, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-800 text-xs">{d.speaker}:</span>
                    <AudioButton text={d.chinese} size="sm" />
                  </div>
                  <div className="font-serif text-base font-bold text-slate-900">{d.chinese}</div>
                  <div className="text-teal-700 font-mono text-xs">{d.pinyin}</div>
                  <div className="text-slate-600 text-xs">{d.indonesian}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setActiveTab("grammar")}>
                Kembali
              </Button>
              <Button variant="primary" onClick={() => setActiveTab("summary")} className="gap-2">
                <span>Rangkuman & Selesai</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* TAB 6: SUMMARY & COMPLETION */}
        {activeTab === "summary" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Rangkuman Pelajaran
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {content.summary}
              </p>
            </div>

            {/* Completion Box */}
            <div className="p-6 rounded-3xl bg-teal-50 border border-teal-200 text-center space-y-4">
              <div className="w-12 h-12 bg-teal-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Trophy className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-teal-950">
                  {isCompleted ? "Pelajaran Selesai!" : "Sudah Memahami Materi Ini?"}
                </h4>
                <p className="text-xs sm:text-sm text-teal-800 mt-1 max-w-md mx-auto">
                  {isCompleted
                    ? "Pencapaian tersimpan di database! Anda memperoleh 50 XP dan kosakata telah ditambahkan ke sistem Spaced Repetition."
                    : "Selesaikan pelajaran ini untuk mencatat progress Anda ke database dan menambahkan kosakata ke flashcard harian."}
                </p>
              </div>

              {!isCompleted ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleComplete}
                  isLoading={isCompleting}
                  className="font-bold shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Selesaikan Pelajaran (+50 XP)</span>
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    variant="primary"
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="gap-2"
                  >
                    <span>Lanjut ke Silabus Pelajaran</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/vocabulary/review")}
                  >
                    <span>Review Flashcard Kosakata</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
