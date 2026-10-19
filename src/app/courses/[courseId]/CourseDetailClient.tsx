"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  Play,
  Trophy,
} from "lucide-react";
import { Course } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function CourseDetailClient({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success) {
          const found = (data.courses as Course[]).find(
            (c) => c.id === courseId || c.slug === courseId
          );
          setCourse(found || null);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Jalur belajar tidak ditemukan</h2>
          <p className="text-xs text-slate-600">Silakan kembali ke katalog untuk memilih jalur lain.</p>
          <Link href="/courses">
            <Button variant="outline">Kembali ke Katalog</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const units = course.units || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Semua Jalur Belajar</span>
        </Link>

        {/* Course Header Banner */}
        <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                P{course.pathIndex}
              </span>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                {course.level}
              </span>
            </div>
            <span className="font-serif text-teal-800 text-base font-bold">
              {course.titleChinese}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {course.description}
          </p>
        </div>

        {/* Units & Lessons Syllabus */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Silabus Pembelajaran
          </h2>

          <div className="space-y-6">
            {units.map((unit, uIdx) => (
              <div
                key={unit.id}
                className="bg-white border border-slate-300 rounded-3xl p-6 shadow-sm space-y-5 motion-safe:animate-[fade-up_500ms_ease-out_both]"
              >
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Unit {uIdx + 1}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{unit.title}</h3>
                    <p className="text-xs text-slate-700 mt-0.5">{unit.description}</p>
                  </div>
                  <span className="font-serif text-teal-800 text-sm font-semibold shrink-0">
                    {unit.titleChinese}
                  </span>
                </div>

                {/* Lessons in Unit */}
                <div className="space-y-3">
                  {(unit.lessons || []).map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-300 hover:border-teal-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {lIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {lesson.title}
                            </h4>
                            <span className="font-serif text-teal-800 text-xs hidden sm:inline">
                              {lesson.titleChinese}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{lesson.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes} menit
                        </span>

                        <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                          <Button size="sm" variant="primary" className="gap-1 text-xs">
                            <Play className="w-3 h-3 fill-white" />
                            <span>Mulai</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quizzes in Unit */}
                {(unit.quizzes || []).length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Evaluasi & Kuis Akhir Unit:
                    </span>
                    {(unit.quizzes || []).map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-4 rounded-2xl bg-amber-50 border border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                            <FileQuestion className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{quiz.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{quiz.description}</p>
                          </div>
                        </div>

                        <Link href={`/courses/${course.id}/quizzes/${quiz.id}`}>
                          <Button size="sm" variant="secondary" className="border border-amber-300 text-amber-950 hover:bg-amber-200 text-xs gap-1.5 shrink-0">
                            <Trophy className="w-3.5 h-3.5 text-amber-600" />
                            <span>Mulai Kuis ({quiz.passingScore}% Lulus)</span>
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
