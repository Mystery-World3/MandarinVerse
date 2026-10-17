import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "@neondatabase/serverless";
import { isPostgresConfigured } from "./db";

const secret =
  process.env.BETTER_AUTH_SECRET || "mandarinverse-production-super-secret-key-32chars";
const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const auth = betterAuth({
  secret,
  baseURL,
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
