"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileQuestion,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Upload,
} from "lucide-react";
import { Course } from "@/lib/types";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { data: session, isPending } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [importJson, setImportJson] = useState("");
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});
  const [isImporting, setIsImporting] = useState(false);

  const user = session?.user;
  const isAdmin = (user as any)?.role === "admin";

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleExportBackup = async () => {
    window.open("/api/admin/courses", "_blank");
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    setIsImporting(true);
    setImportStatus({});
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: importJson,
      });

      const data = await res.json();
      if (data.success) {
        setImportStatus({
          success: true,
          message: `Berhasil mengimpor ${data.count} jalur kurikulum ke database!`,
        });
        setImportJson("");
        loadCourses();
      } else {
        setImportStatus({ success: false, message: data.error || "Gagal mengimpor kurikulum." });
      }
    } catch (err: any) {
      setImportStatus({ success: false, message: "Terjadi kesalahan koneksi saat impor." });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isPending && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbfbfa]">
        <Navbar />
        <div className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Akses Khusus Administrator</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Halaman ini dilindungi oleh otorisasi berbasis peran (RBAC). Pengguna dengan peran biasa tidak diizinkan mengubah konten kurikulum.
          </p>
          <div className="p-4 bg-slate-100 rounded-2xl text-left text-xs font-mono text-slate-800 space-y-1">
            <p className="font-bold text-slate-900 mb-1 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> Cara Promosi Akun Pertama ke Admin:
            </p>
            <p>Jalankan perintah ini di terminal server Anda:</p>
            <code className="text-teal-700 font-bold block bg-white p-2 rounded border border-slate-200 mt-1">
              npm run db:make-admin &lt;email-anda&gt;
            </code>
          </div>
          <Link href="/dashboard">
            <Button variant="primary">Kembali ke Dashboard</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider border border-teal-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                Panel Administrator
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Manajemen Kurikulum & Konten Pembelajaran
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Kelola jalur belajar, unit, pelajaran, kuis, dan pipeline impor/ekspor kurikulum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportBackup} className="gap-1.5">
              <Download className="w-4 h-4" />
              <span>Ekspor Kurikulum (JSON)</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={loadCourses} className="gap-1.5">
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang</span>
            </Button>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Daftar Jalur Belajar ({courses.length} Jalur Aktif)
            </h3>
            <span className="text-xs text-slate-600">Semua materi tersimpan dalam schema terstruktur</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Jalur</th>
                  <th className="px-4 py-3">Judul Kursus</th>
                  <th className="px-4 py-3">Hanzi</th>
                  <th className="px-4 py-3">Tingkat</th>
                  <th className="px-4 py-3">Pelajaran</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => {
                  const lessonCount = (c.units || []).reduce(
                    (acc, u) => acc + (u.lessons || []).length,
                    0
                  );
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-teal-800">P{c.pathIndex}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{c.title}</td>
                      <td className="px-4 py-3.5 font-serif text-teal-800 font-medium">
                        {c.titleChinese}
                      </td>
                      <td className="px-4 py-3.5">{c.level}</td>
                      <td className="px-4 py-3.5">{lessonCount} Pelajaran</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Dipublikasikan
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/courses/${c.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON Import/Export Pipeline */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-700" />
            <h3 className="font-bold text-base text-slate-900">
              Pipeline Impor Kurikulum (JSON)
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Anda dapat menambah puluhan materi baru sekaligus tanpa mengubah kode frontend. Cukup buat atau edit file JSON kurikulum dan tempelkan di bawah ini.
          </p>

          {importStatus.message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold ${
                importStatus.success
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {importStatus.message}
            </div>
          )}

          <form onSubmit={handleImportSubmit} className="space-y-3">
            <textarea
              rows={6}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={`{\n  "courses": [\n    {\n      "id": "course-new",\n      "title": "Percakapan Tingkat Lanjut",\n      ...\n    }\n  ]\n}`}
              className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-slate-900"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isImporting}
                disabled={!importJson.trim()}
                className="gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Validasi & Impor ke Database</span>
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
