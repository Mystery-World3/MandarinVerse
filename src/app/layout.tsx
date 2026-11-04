import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeToggle from "@/components/theme-toggle";
import { AuthGate } from "@/components/auth/AuthGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MandarinVerse — Belajar Bahasa Mandarin dari Nol untuk Penutur Indonesia",
  description:
    "Platform pembelajaran bahasa Mandarin terstruktur: Hanzi, Pinyin bernada, Spaced Repetition (SM-2), latihan interaktif, dan AI Mandarin Tutor dalam Bahasa Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AuthGate>{children}</AuthGate>
        <ThemeToggle />
      </body>
    </html>
  );
}
