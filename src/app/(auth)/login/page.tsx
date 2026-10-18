"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, ShieldAlert, Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Silakan lengkapi email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Email atau kata sandi tidak sesuai.");
      
      } else {
        const meResponse = await fetch("/api/user/me", {
          method: "GET",
          cache: "no-store",
        });

        const me = await meResponse.json();

        if (!meResponse.ok || !me.success) {
          setErrorMessage(
            "Login berhasil, tetapi data sesi gagal dibaca. Silakan muat ulang halaman."
          );
          return;
        }

        if (me.user.role === "admin") {
          router.replace("/admin");
        } else if (me.user.role === "learner") {
          router.replace("/dashboard");
        } else {
          setErrorMessage("Role akun tidak dikenali. Hubungi administrator.");
        }
      }

    }  catch (err: unknown) {
        console.error("Login gagal:", err);

        setErrorMessage(
        "Terjadi kesalahan saat login. Silakan coba lagi."
        );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: "learner" | "admin") => {
    if (role === "admin") {
      setEmail("admin@mandarinverse.com");
      setPassword("AdminMandarin123!");
    } else {
      setEmail("demo@mandarinverse.com");
      setPassword("BelajarMandarin123!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#fbfbfa]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            华
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MandarinVerse</h1>
            <p className="text-xs text-slate-600">Masuk ke Ruang Belajar Anda</p>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-3xl sm:px-10 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-teal-700 hover:underline cursor-pointer">
                  Lupa sandi?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
                />
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-semibold rounded-xl"
              isLoading={isLoading}
            >
              Masuk Sekarang
            </Button>
          </form>

          {/* Quick Demo Acccount Helpers */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 block text-center">
              Akses Cepat Pengujian (Instant Testing):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("learner")}
                className="p-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer text-center"
              >
                Akun Pembelajar
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                className="p-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all cursor-pointer text-center"
              >
                Akun Admin
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-teal-700 hover:underline">
                Daftar Gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
