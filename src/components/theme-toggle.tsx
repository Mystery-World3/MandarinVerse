"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mandarinverse-theme";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.classList.toggle("dark", initial === "dark");
    setTheme(initial);
    setReady(true);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!ready}
      aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
      className="fixed bottom-5 right-5 z-[100] inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-lg transition hover:scale-105 hover:shadow-xl disabled:opacity-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
