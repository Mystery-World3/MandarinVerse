"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Volume2, AlertCircle } from "lucide-react";
import { TutorMessage } from "@/lib/types";
import { AudioButton } from "../learning/AudioButton";
import { Button } from "../ui/Button";

interface TutorChatProps {
  initialLessonContext?: string;
}

export function TutorChat({ initialLessonContext }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Halo! Saya Tutor AI MandarinVerse Anda. Saya siap membantu Anda memahami Hanzi, Pinyin, 4 nada, tata bahasa, dan percakapan bahasa Mandarin dalam Bahasa Indonesia. Ada yang ingin Anda tanyakan hari ini?",
      createdAt: "2026-10-17T00:00:00.000Z",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lessonContext, setLessonContext] = useState(initialLessonContext || "");
  const [providerInfo, setProviderInfo] = useState<{ configured: boolean; provider?: string }>({
    configured: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: TutorMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          lessonContext: lessonContext || undefined,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProviderInfo({
          configured: data.configured,
          provider: data.provider,
        });

        const botReply: TutorMessage = {
          id: `msg-${Date.now()}-reply`,
          role: "assistant",
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        const errorReply: TutorMessage = {
          id: `msg-${Date.now()}-err`,
          role: "assistant",
          content: `⚠️ ${data.error || "Gagal memproses pesan."}`,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorReply]);
      }
    } catch (err: any) {
      const errorReply: TutorMessage = {
        id: `msg-${Date.now()}-err`,
        role: "assistant",
        content: "⚠️ Terjadi gangguan koneksi ke server tutor. Silakan coba lagi.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
      {/* Tutor Header */}
      <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">MandarinVerse AI Tutor</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-900 dark:text-teal-100 bg-teal-100 dark:bg-teal-900/70 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-teal-600" />
                {providerInfo.provider || "Mandarin Guide"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Penjelasan interaktif dalam Bahasa Indonesia & Pinyin akurat
            </p>
          </div>
        </div>

        {lessonContext && (
          <span className="hidden sm:inline-block text-xs bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-100 px-3 py-1 rounded-full font-medium">
            Konteks: {lessonContext}
          </span>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isBot = m.role === "assistant";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isBot ? "justify-start" : "justify-end"}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  文
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  isBot
                    ? "bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    : "bg-teal-700 text-white shadow-xs"
                }`}
              >
                {m.content}
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 font-bold text-xs">
              文
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-600 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
              <span>Tutor sedang merangkum penjelasan...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan kata, nada, atau aturan tata bahasa Mandarin..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder:text-slate-500 dark:placeholder:text-slate-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-4 py-2.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
