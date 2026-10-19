"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  Lock,
  Search,
  Sparkles,
} from "lucide-react";
import { Course } from "@/lib/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        if (data.success) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.titleChinese.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200">
              Kurikulum Lengkap
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Jalur Belajar Bahasa Mandarin
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-2xl leading-relaxed">
              8 jalur kurikulum terstruktur dirancang sistematis dari fondasi bunyi, aksara, hingga percakapan praktis sehari-hari.
            </p>
          </div>

          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari jalur atau topik..."
              className="w-full px-4 py-2.5 pl-10 rounded-2xl border border-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm text-slate-950 bg-white placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-600">Memuat kurikulum...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-300 p-8 shadow-sm">
            <p className="text-slate-600 text-sm">Tidak ada jalur belajar yang cocok dengan &quot;{searchQuery}&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((course) => {
              const totalLessons = (course.units || []).reduce(
                (acc, u) => acc + (u.lessons || []).length,
                0
              );
              const totalQuizzes = (course.units || []).reduce(
                (acc, u) => acc + (u.quizzes || []).length,
                0
              );

              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-lg hover:border-teal-500 transition-all duration-300 hover:-translate-y-1 motion-safe:animate-[fade-up_500ms_ease-out_both] flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                          P{course.pathIndex}
                        </span>
                        <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
                          {course.level}
                        </span>
                      </div>
                      <span className="font-serif text-teal-800 text-sm font-bold">
                        {course.titleChinese}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Units & Lessons Preview */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-4 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                          {totalLessons} Pelajaran
                        </span>
                        <span className="flex items-center gap-1">
                          <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
                          {totalQuizzes} Evaluasi / Kuis
                        </span>
                      </div>

                      {course.units && course.units[0]?.lessons && (
                        <div className="bg-slate-100 p-3 rounded-2xl border border-slate-300 space-y-1.5 text-xs text-slate-800">
                          {course.units[0].lessons.slice(0, 3).map((l, i) => (
                            <div key={l.id} className="flex items-center gap-2 truncate">
                              <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center text-[10px] shrink-0 font-bold">
                                {i + 1}
                              </span>
                              <span className="truncate">{l.title}</span>
                              <span className="text-[10px] text-teal-800 font-serif ml-auto shrink-0">
                                {l.titleChinese}
                              </span>
                            </div>
                          ))}
                          {course.units[0].lessons.length > 3 && (
                            <div className="text-[11px] text-slate-700 italic pt-0.5">
                              + {course.units[0].lessons.length - 3} pelajaran lainnya...
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Tersedia & Terbuka
                    </span>

                    <Link href={`/courses/${course.id}`}>
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <span>Buka Materi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
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
