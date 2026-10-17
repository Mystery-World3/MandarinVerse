"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Layers,
  Menu,
  MessageSquare,
  Sparkles,
  Trophy,
  User as UserIcon,
  X,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const user = session?.user;
  const isAdmin = (user as any)?.role === "admin";

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Compass },
    { href: "/courses", label: "Jalur Belajar", icon: BookOpen },
    { href: "/vocabulary", label: "Kosakata", icon: Layers },
    { href: "/vocabulary/review", label: "Review SRS", icon: Sparkles },
    { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
    { href: "/progress", label: "Pencapaian", icon: Trophy },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (err) {
      window.location.href = "/";
    }
  };

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-800 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-900/20 group-hover:scale-105 transition-transform">
                <span className="font-serif font-bold text-lg leading-none">华</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-teal-700 transition-colors">
                  Mandarin<span className="text-teal-700">Verse</span>
                </span>
                <span className="text-[10px] text-slate-600 -mt-1 font-medium">
                  Belajar Mandarin dari Nol
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-teal-50 text-teal-800 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-teal-700" : "text-slate-600"}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center font-semibold text-xs">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "MB"}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {user.name || "Pembelajar"}
                    </span>
                    <span className="text-[10px] text-teal-600 font-medium">
                      {(user as any).role === "admin" ? "Admin" : "Pemula"}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Keluar"
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  Mulai Gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Buka menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-teal-700" : "text-slate-600"}`} />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "MB"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-1 pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center py-2.5 text-sm font-medium text-white bg-teal-700 rounded-xl hover:bg-teal-800"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
