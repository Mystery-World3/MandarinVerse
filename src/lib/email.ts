type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum diatur.");
  }
  if (!from) {
    throw new Error("EMAIL_FROM belum diatur.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend email error:", response.status, detail);
    throw new Error("Email tidak dapat dikirim. Periksa konfigurasi Resend.");
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  const safeName = name.replace(/[<>]/g, "");
  const text = `Selamat datang di MandarinVerse, ${safeName}! Akun kamu sudah dibuat. Verifikasi email kamu, lalu mulai perjalanan belajar bahasa Mandarin dari nol bersama kami.`;
  await sendTransactionalEmail({
    to: email,
    subject: "Selamat datang di MandarinVerse! 欢迎",
    text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a;max-width:600px;margin:auto"><div style="background:#0f766e;padding:24px;border-radius:16px 16px 0 0;color:#fff"><h1 style="margin:0">欢迎来到 MandarinVerse!</h1><p style="margin:8px 0 0">Selamat datang di perjalanan belajar Mandarin kamu.</p></div><div style="padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px"><p>Hai <strong>${safeName}</strong>,</p><p>Terima kasih sudah bergabung dengan MandarinVerse. Kami siap menemani kamu belajar kosakata, pinyin, nada, dan percakapan Mandarin langkah demi langkah.</p><p>Untuk mulai, buka MandarinVerse dan selesaikan verifikasi email kamu.</p><p style="color:#64748b;font-size:13px">Jika kamu tidak membuat akun ini, kamu bisa mengabaikan email ini.</p></div></div>`,
  });
}
