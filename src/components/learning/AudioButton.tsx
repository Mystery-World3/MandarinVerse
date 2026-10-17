"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSpeechSupported, speakChinese } from "@/lib/speech";

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function AudioButton({
  text,
  className = "",
  size = "md",
  label,
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    setIsPlaying(true);
    try {
      await speakChinese(text);
    } finally {
      setIsPlaying(false);
    }
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const buttonSizes = {
    sm: "p-1 rounded-md",
    md: "p-1.5 rounded-lg",
    lg: "p-2 rounded-xl",
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={`Dengarkan pengucapan ${text}`}
      title={`Dengarkan: ${text}`}
      className={`inline-flex items-center gap-1.5 transition-all text-teal-700 hover:text-teal-900 hover:bg-teal-50 active:scale-95 cursor-pointer ${buttonSizes[size]} ${
        isPlaying ? "bg-teal-100 text-teal-900 ring-2 ring-teal-400" : ""
      } ${className}`}
    >
      <Volume2 className={`${iconSizes[size]} ${isPlaying ? "animate-pulse" : ""}`} />
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
}
