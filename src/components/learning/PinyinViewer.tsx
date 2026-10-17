"use client";

import React from "react";
import { AudioButton } from "./AudioButton";

interface PinyinViewerProps {
  hanzi: string;
  pinyin: string;
  indonesian?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showAudio?: boolean;
}

export function PinyinViewer({
  hanzi,
  pinyin,
  indonesian,
  size = "md",
  showAudio = true,
}: PinyinViewerProps) {
  const sizeClasses = {
    sm: {
      hanzi: "text-lg",
      pinyin: "text-xs",
      indonesian: "text-xs",
    },
    md: {
      hanzi: "text-2xl font-bold",
      pinyin: "text-sm",
      indonesian: "text-xs",
    },
    lg: {
      hanzi: "text-4xl font-bold",
      pinyin: "text-base font-medium",
      indonesian: "text-sm",
    },
    xl: {
      hanzi: "text-6xl font-bold",
      pinyin: "text-xl font-semibold",
      indonesian: "text-base",
    },
  }[size];

  return (
    <div className="inline-flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all text-center group">
      <span className={`text-teal-700 tracking-wide font-mono ${sizeClasses.pinyin}`}>
        {pinyin}
      </span>
      <span className={`font-serif text-slate-900 tracking-wider my-1 ${sizeClasses.hanzi}`}>
        {hanzi}
      </span>
      {indonesian && (
        <span className={`text-slate-600 mt-1 max-w-[180px] line-clamp-2 ${sizeClasses.indonesian}`}>
          {indonesian}
        </span>
      )}
      {showAudio && (
        <div className="mt-2">
          <AudioButton text={hanzi} size="sm" />
        </div>
      )}
    </div>
  );
}
