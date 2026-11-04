import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";
import { isPostgresConfigured } from "./db";
import { sendTransactionalEmail, sendWelcomeEmail } from "./email";

// In production, BETTER_AUTH_SECRET must be a long random string.
// Generate one with: openssl rand -base64 32
if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET belum diatur. Hasilkan nilai acak minimal 32 karakter dan tambahkan ke environment variables produksi."
  );
}

const secret =
  process.env.BETTER_AUTH_SECRET ||
  // Only used in development / CI when the variable is not set
  "dev-only-secret-DO-NOT-USE-IN-PRODUCTION-replace-me";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  secret,
  baseURL,
  trustedOrigins: [
    "https://mandarin-verse.vercel.app",
    "https://mandarinverse-kohl.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ],

  ...(isPostgresConfigured()
    ? {
      database: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }
    : {}),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Verifikasi email MandarinVerse",
        text: `Hai ${user.name || "Pembelajar"}, verifikasi email kamu melalui tautan ini (berlaku selama 1 jam): ${url}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a;max-width:600px;margin:auto;padding:24px"><h1 style="color:#0f766e">Verifikasi email kamu</h1><p>Hai ${(user.name || "Pembelajar").replace(/[<>]/g, "")},</p><p>Terima kasih sudah mendaftar di MandarinVerse. Klik tombol di bawah untuk memverifikasi alamat email kamu.</p><p><a href="${url}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Verifikasi Email</a></p><p>Jika tombol tidak bisa dibuka, salin tautan ini ke browser:</p><p style="word-break:break-all">${url}</p><p style="color:#64748b;font-size:13px">Tautan berlaku selama 1 jam. Jika kamu tidak merasa mendaftar, abaikan email ini.</p></div>`,
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendWelcomeEmail(user.name || "Pembelajar", user.email);
          } catch (error) {
            // A welcome-email failure must not undo account creation.
            console.error("Welcome email could not be sent:", error);
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "learner",
        // Role must NEVER be settable by the user themselves.
        // It is set server-side only via the db:make-admin script.
        input: false,
      },
      goal: {
        type: "string",
        required: false,
      },
      dailyTargetMinutes: {
        type: "number",
        defaultValue: 10,
      },
      level: {
        type: "string",
        defaultValue: "Beginner",
      },
    },
  },
  plugins: [admin()],
});
