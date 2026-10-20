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

  if (
    (lower.includes("b") && lower.includes("p") && (lower.includes("pinyin") || lower.includes("pengucapan") || lower.includes("beda"))) ||
    lower.includes("aspirasi") ||
    lower.includes("bunyi b dan p")
  ) {
    return `## Perbedaan bunyi **b** dan **p** dalam Pinyin

Dalam Pinyin Mandarin, **b** dan **p** sama-sama diucapkan tanpa getaran pita suara seperti pasangan bunyi dalam bahasa Indonesia, tetapi perbedaan utamanya adalah **hembusan udara**.

- **b**: bunyi tidak berhembus kuat. Tempelkan kedua bibir, lalu lepaskan dengan hembusan kecil. Contoh: **爸 (bà)** — ayah.
- **p**: bunyi beraspirasi, yaitu disertai hembusan udara yang jelas. Contoh: **怕 (pà)** — takut.

### Cara latihan sederhana
1. Letakkan telapak tangan atau selembar tisu di depan mulut.
2. Ucapkan **bā** — tisu seharusnya bergerak sedikit.
3. Ucapkan **pā** — hembusan udara terasa lebih kuat dan tisu bergerak lebih jelas.

**Penting:** jangan menyamakan Pinyin **b** persis dengan huruf “b” Indonesia yang bersuara, atau Pinyin **p** dengan “p” Indonesia. Dalam Mandarin, kontras utamanya adalah ada atau tidaknya aspirasi. Latih pasangan **bā (八 — delapan)** dan **pā** untuk merasakan bedanya.`;
  }

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

  if (lower.includes("restoran") || lower.includes("makanan") || lower.includes("memesan") || lower.includes("pesan makanan") || lower.includes("menu") || lower.includes("makan")) {
    return `## Memesan makanan di restoran 🍜

Berikut frasa praktis yang bisa langsung Anda gunakan:

- **服务员 (fúwùyuán)** — Pelayan.
- **请给我菜单 (qǐng gěi wǒ càidān)** — Tolong berikan saya menu.
- **我想要这个 (wǒ xiǎng yào zhège)** — Saya ingin yang ini.
- **我要一碗米饭 (wǒ yào yì wǎn mǐfàn)** — Saya mau semangkuk nasi.
- **请问，这个多少钱？(qǐngwèn, zhège duōshǎo qián?)** — Permisi, berapa harga ini?
- **买单 (mǎidān)** — Minta tagihan / bayar.

### Contoh percakapan

**顾客 (gùkè) — Pelanggan:** 你好！请给我菜单。 (Nǐ hǎo! Qǐng gěi wǒ càidān.) — Halo! Tolong berikan menu.

**服务员 (fúwùyuán) — Pelayan:** 好的。您想吃什么？ (Hǎo de. Nín xiǎng chī shénme?) — Baik. Anda ingin makan apa?

**顾客 (gùkè) — Pelanggan:** 我要一碗米饭和一杯水。 (Wǒ yào yì wǎn mǐfàn hé yì bēi shuǐ.) — Saya mau semangkuk nasi dan segelas air.

**服务员 (fúwùyuán) — Pelayan:** 好的，请稍等。 (Hǎo de, qǐng shāo děng.) — Baik, silakan tunggu sebentar.

**Tips:** 请 (qǐng) membuat permintaan terdengar lebih sopan. Untuk pemula, pola **我要…… (wǒ yào...) — Saya mau...** mudah digunakan.`;
  }

  return `Maaf, layanan AI generatif belum dikonfigurasi, jadi saya belum bisa menjawab pertanyaan ini secara khusus.

Untuk mengaktifkan tutor AI, tambahkan AI_PROVIDER, AI_API_KEY, dan AI_MODEL di Environment Variables Vercel, lalu redeploy. Sementara itu, coba tanyakan tentang nada Mandarin, salam, perkenalan, angka, atau waktu yang sudah didukung oleh panduan dasar.`;
}

export async function askMandarinTutor(request: TutorRequest): Promise<TutorResponse> {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = process.env.AI_API_KEY;
  // Accept either a bare Gemini model ID or a resource name such as "models/gemini-2.5-flash".
  const configuredModel = (process.env.AI_MODEL || (provider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash")).trim();
  const model = configuredModel.replace(/^models\\//, "").replace(/:generateContent$/, "");

  // If no API key is provided, use high-quality offline tutor
  if (!apiKey) {
    return {
      reply: getOfflineTutorResponse(request.message, request.lessonContext),
      source: "fallback",
      configured: false,
    };
  }

  const systemPrompt = [
    "Anda adalah Tutor Bahasa Mandarin pribadi yang ramah, sabar, dan akurat di platform MandarinVerse.",
    "Audiens Anda adalah orang Indonesia yang belajar bahasa Mandarin dari nol.",
    "Jawab pertanyaan Mandarin secara luas: Hanzi, Pinyin, nada, pelafalan, tata bahasa, kosakata, terjemahan, penggunaan sehari-hari, budaya bahasa, latihan, dan percakapan. Jangan batasi jawaban hanya pada contoh pertanyaan di UI.",
    "Jawab inti pertanyaan terlebih dahulu dalam Bahasa Indonesia yang jelas dan sesuai tingkat pemula.",
    "Untuk kosakata atau kalimat Mandarin, sertakan Hanzi, Pinyin dengan tanda nada, dan arti Bahasa Indonesia. Contoh: 谢谢 (xièxie) — terima kasih.",
    "Sertakan contoh relevan dan jelaskan alasan atau perbedaannya bila membantu.",
    "Gunakan riwayat percakapan sebagai konteks agar jawaban lanjutan konsisten.",
    "Jangan mengarang Hanzi, Pinyin, aturan tata bahasa, atau fakta budaya. Jika ada beberapa arti, jelaskan; jika kurang konteks, tanyakan; jika tidak yakin, katakan dengan jujur.",
    "Jika pertanyaan di luar pembelajaran Mandarin, arahkan dengan sopan kembali ke topik Mandarin.",
    "Jangan mengklaim sudah mencari atau memverifikasi sumber eksternal.",
    request.lessonContext ? "Konteks pelajaran saat ini: " + request.lessonContext + ". Gunakan bila relevan, tetapi tetap jawab pertanyaan murid." : "",
  ].filter(Boolean).join("\n");

  try {
    if (provider === "gemini") {
      // Google Gemini API call
      const history = (request.conversationHistory || [])
        .filter((item) => item.role !== "system" && item.content.trim())
        .slice(-8)
        .map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content }],
        }));

      const requestBody = JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          ...history,
          { role: "user", parts: [{ text: request.message }] },
        ],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1400 },
      });

      let activeModel = model;
      let res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: requestBody,
        }
      );

      // If Vercel has an outdated/unsupported AI_MODEL value, retry once with a known fallback.
      if (res.status === 404 && activeModel !== "gemini-2.5-flash") {
        console.warn(`Gemini model "${activeModel}" returned 404; retrying with gemini-2.5-flash.`);
        activeModel = "gemini-2.5-flash";
        res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: requestBody,
          }
        );
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Gemini API error:", errorText);
        return {
          reply: `Tutor AI mengalami kendala saat memproses pertanyaan (HTTP ${res.status}). Coba lagi sebentar. Jika berulang, administrator perlu memeriksa konfigurasi provider/model AI di Vercel.\n\nPanduan dasar sementara:\n${getOfflineTutorResponse(request.message, request.lessonContext)}`,
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
