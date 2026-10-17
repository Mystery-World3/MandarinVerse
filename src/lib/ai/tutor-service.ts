import { z } from "zod";

export const TutorRequestSchema = z.object({
  message: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
  lessonContext: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .optional(),
});

export type TutorRequest = z.infer<typeof TutorRequestSchema>;

export interface TutorResponse {
  reply: string;
  pinyin?: string;
  source: "ai" | "fallback";
  provider?: string;
  configured: boolean;
  error?: string;
}

// In-memory rate limiter per IP / User: max 20 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRate = rateLimitMap.get(identifier);

  if (!userRate || now > userRate.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRate.count >= limit) {
    return false;
  }

  userRate.count += 1;
  return true;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY);
}

/**
 * Intelligent rule-based assistant when no external AI API key is configured.
 * Answers common beginner Mandarin questions in clear Indonesian.
 */
function getOfflineTutorResponse(message: string, lessonContext?: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("nada") || lower.includes("tone") || lower.includes("suara")) {
    return `Dalam bahasa Mandarin ada **4 nada utama + 1 nada netral**:\n\n1. **Nada 1 (—) Datar & Tinggi**: Contoh *mā* (ibu). Ucapkan stabil dan tinggi seperti dokter meminta bilang 'Aaa'.\n2. **Nada 2 (/) Naik**: Contoh *má* (rami). Seperti intonasi bertanya 'Hah?'.\n3. **Nada 3 (V) Turun-Naik**: Contoh *mǎ* (kuda). Rendah di tenggorokan lalu sedikit naik.\n4. **Nada 4 (\\) Turun Tegas**: Contoh *mà* (memarahi). Jatuh cepat seperti menghentak 'Stop!'.\n5. **Nada Netral**: Ringan, pendek, dan santai (contoh: *ma* pada 你好吗).`;
  }

  if (lower.includes("apa kabar") || lower.includes("halo") || lower.includes("ni hao") || lower.includes("salam")) {
    return `Untuk menyapa dalam bahasa Mandarin:\n\n- **你好 (nǐ hǎo)**: Halo / Apa kabar untuk teman sebaya.\n- **您好 (nín hǎo)**: Halo sopan untuk orang yang lebih tua atau guru.\n- **你好吗？(nǐ hǎo ma?)**: Bagaimana kabarmu? (Jawabannya: 我很好 - Wǒ hěn hǎo = Saya sangat baik).`;
  }

  if (lower.includes("terima kasih") || lower.includes("xiexie") || lower.includes("makasih")) {
    return `Ungkapan terima kasih:\n\n- **谢谢 (xièxie)**: Terima kasih.\n- **不客气 (bú kèqi)**: Sama-sama / Jangan sungkan.\n- **不用谢 (búyòng xiè)**: Tidak perlu berterima kasih.`;
  }

  if (lower.includes("nama") || lower.includes("siapa namamu") || lower.includes("perkenalan")) {
    return `Cara memperkenalkan nama:\n\n- **你叫什么名字？(Nǐ jiào shénme míngzi?)**: Siapa namamu?\n- **我叫... (Wǒ jiào...)**: Nama saya...\nContoh: *我叫布迪 (Wǒ jiào Bùdí)* = Nama saya Budi.`;
  }

  if (lower.includes("angka") || lower.includes("hitung") || lower.includes("nomor")) {
    return `Angka 1 sampai 10 dalam bahasa Mandarin:\n\n- 1: 一 (yī)\n- 2: 二 (èr) / 两 (liǎng untuk jumlah)\n- 3: 三 (sān)\n- 4: 四 (sì)\n- 5: 五 (wǔ)\n- 6: 六 (liù)\n- 7: 七 (qī)\n- 8: 八 (bā)\n- 9: 九 (jiǔ)\n- 10: 十 (shí)\n\nUntuk belasan: 11 = 十一 (shíyī), 12 = 十二 (shí'èr).\nUntuk puluhan: 20 = 二十 (èrshí), 35 = 三十五 (sānshíwǔ).`;
  }

  if (lower.includes("jam") || lower.includes("waktu") || lower.includes("hari")) {
    return `Kaidah waktu bahasa Mandarin:\n\n- **现在几点？(Xiànzài jǐ diǎn?)**: Sekarang jam berapa?\n- **两点 (liǎng diǎn)**: Jam dua (ingat: gunakan 两 bukan 二 untuk jam 2!).\n- **星期一 (xīngqīyī)**: Hari Senin s.d **星期天 (xīngqītiān)**: Hari Minggu.\n- **今天 (jīntiān)**: Hari ini, **明天 (míngtiān)**: Besok.`;
  }

  return `Halo! Saya **MandarinVerse AI Tutor** pribadi Anda.\n\n` +
    (lessonContext ? `📌 Konteks Pelajaran Saat Ini: **${lessonContext}**\n\n` : "") +
    `Pertanyaan Anda: "*${message}*"\n\n` +
    `💡 **Tips Belajar**: Untuk pemula penutur bahasa Indonesia, selalu perhatikan:\n` +
    `1. **Pinyin & Nada**: Pastikan melatih 4 nada agar lawan bicara tidak salah paham.\n` +
    `2. **Urutan Kalimat**: Keterangan waktu selalu diletakkan SEBELUM kata kerja (contoh: *我晚上学习* - Wǒ wǎnshang xuéxí = Saya malam hari belajar).\n` +
    `3. **Tanya apa saja**: Anda bisa menanyakan tata bahasa, perbedaan kata, atau arti kalimat Mandarin lainnya!\n\n` +
    `*(Catatan Sistem: Kunci API AI eksternal belum diatur di server .env.local. Respon ini dihasilkan oleh Asisten Bahasa Mandarin internal MandarinVerse. Tambahkan AI_API_KEY untuk mengaktifkan model LLM aktif).*`;
}

export async function askMandarinTutor(request: TutorRequest): Promise<TutorResponse> {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || (provider === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash");

  // If no API key is provided, use high-quality offline tutor
  if (!apiKey) {
    return {
      reply: getOfflineTutorResponse(request.message, request.lessonContext),
      source: "fallback",
      configured: false,
    };
  }

  const systemPrompt = `Anda adalah Tutor Bahasa Mandarin pribadi yang ramah, sabar, dan berwawasan di platform "MandarinVerse".
Audiens Anda adalah orang Indonesia pemula yang belajar bahasa Mandarin dari nol.
Aturan:
1. Berikan penjelasan dalam Bahasa Indonesia yang hangat, jelas, dan mudah dipahami.
2. Setiap kali menyebutkan kosakata atau kalimat Mandarin, SELALU sertakan Hanzi (karakter sederhana), Pinyin dengan tanda nada yang akurat, dan arti bahasa Indonesia.
   Format: Hanzi (Pinyin) - Arti
   Contoh: 谢谢 (xièxie) - Terima kasih
3. Berikan contoh kalimat praktis dan jelaskan perbedaannya dengan tata bahasa Indonesia jika relevan.
4. Jika murid bertanya tentang pengucapan atau nada, jelaskan posisi lidah dan analogi intonasi bahasa Indonesia.
${request.lessonContext ? `Konteks pelajaran murid saat ini: "${request.lessonContext}". Sesuaikan contoh dengan konteks ini jika relevan.` : ""}`;

  try {
    if (provider === "gemini") {
      // Google Gemini API call
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  ...(request.conversationHistory?.map((h) => ({
                    text: `${h.role === "assistant" ? "Tutor" : "Murid"}: ${h.content}`,
                  })) || []),
                  { text: `Murid: ${request.message}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Gemini API error:", errorText);
        return {
          reply: `Mohon maaf, terjadi kendala saat menghubungi layanan AI (${res.status}). Silakan coba beberapa saat lagi atau tanyakan konsep dasar seperti nada, angka, atau salam.\n\n${getOfflineTutorResponse(request.message, request.lessonContext)}`,
          source: "fallback",
          configured: true,
          error: `API Status ${res.status}`,
        };
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!reply) {
        throw new Error("Format respon API tidak valid");
      }

      return {
        reply,
        source: "ai",
        provider: "Gemini",
        configured: true,
      };
    } else {
      // OpenAI / Groq / OpenRouter OpenAI-compatible API call
      const endpoint =
        provider === "groq"
          ? "https://api.groq.com/openai/v1/chat/completions"
          : provider === "openrouter"
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      const messages = [
        { role: "system", content: systemPrompt },
        ...(request.conversationHistory || []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: request.message },
      ];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("AI provider error:", errorText);
        return {
          reply: `Mohon maaf, layanan AI provider mengalami gangguan (${res.status}). Menggunakan asisten lokal:\n\n${getOfflineTutorResponse(request.message, request.lessonContext)}`,
          source: "fallback",
          configured: true,
          error: `Provider status ${res.status}`,
        };
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;

      return {
        reply: reply || getOfflineTutorResponse(request.message, request.lessonContext),
        source: "ai",
        provider: provider.toUpperCase(),
        configured: true,
      };
    }
  } catch (err: any) {
    console.error("AI Tutor unexpected error:", err);
    return {
      reply: `Terjadi kendala jaringan saat menghubungi AI Tutor. Berikut penjelasan panduan:\n\n${getOfflineTutorResponse(request.message, request.lessonContext)}`,
      source: "fallback",
      configured: true,
      error: err.message,
    };
  }
}
