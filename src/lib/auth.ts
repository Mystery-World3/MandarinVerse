import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";
import { isPostgresConfigured } from "./db";

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
