"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Quiz, Course } from "@/lib/types";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

interface QuizPlayerClientProps {
  courseId: string;
  quizId: string;
}

export default function QuizPlayerClient({ courseId, quizId }: QuizPlayerClientProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`);
        const data = await res.json();
        if (data.success) {
          setQuiz(data.quiz);
          setCourse(data.course);
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    if (quizId) loadQuiz();
  }, [quizId]);

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

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Kuis tidak ditemukan</h2>
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline">Kembali ke Silabus</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 font-semibold hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Silabus</span>
          </Link>
        </div>

        {/* Quiz Runner */}
        <QuizEngine quiz={quiz} />
      </main>

      <Footer />
    </div>
  );
}
