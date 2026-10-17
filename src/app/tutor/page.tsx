"use client";

import React from "react";
import { Bot, HelpCircle, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { TutorChat } from "@/components/tutor/TutorChat";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TutorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200">
            Tutor AI Personal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Konsultasi dengan AI Mandarin Tutor
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Ajukan pertanyaan seputar perbedaan karakter Hanzi, cara pelafalan 4 nada, contoh kalimat sehari-hari, atau tata bahasa Mandarin dalam Bahasa Indonesia.
          </p>
        </div>

        {/* Chat Component */}
        <TutorChat />
      </main>

      <Footer />
    </div>
  );
}
