"use client";

import React, { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { QuestionOption } from "@/lib/types";

interface SentenceBuilderProps {
  options: QuestionOption[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export function SentenceBuilder({ options, onChange, disabled = false }: SentenceBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    onChange(selectedIds);
  }, [selectedIds, onChange]);

  const handleSelect = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) return;
    setSelectedIds((prev) => [...prev, id]);
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleReset = () => {
    if (disabled) return;
    setSelectedIds([]);
  };

  const availableOptions = options.filter((opt) => !selectedIds.includes(opt.id));

  return (
    <div className="space-y-4 w-full">
      {/* Target Sentence Tray */}
      <div className="min-h-16 p-3 rounded-2xl bg-teal-50/50 border-2 border-dashed border-teal-300 flex flex-wrap items-center gap-2">
        {selectedIds.length === 0 ? (
          <span className="text-sm text-teal-700/60 italic select-none">
            Ketuk kata-kata di bawah untuk menyusun kalimat Mandarin yang tepat...
          </span>
        ) : (
          selectedIds.map((id) => {
            const opt = options.find((o) => o.id === id);
            if (!opt) return null;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => handleRemove(id)}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-base font-semibold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{opt.text}</span>
                {!disabled && <span className="text-xs opacity-75">✕</span>}
              </button>
            );
          })
        )}
      </div>

      {/* Available Word Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {availableOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt.id)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 hover:border-teal-500 text-slate-800 rounded-xl text-base font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {opt.text}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
