
import { headers } from "next/headers";
import { auth } from "./auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "learner" | "admin";
  goal?: string;
  dailyTargetMinutes?: number;
  level?: string;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (session?.user) {
      const rawRole = (session.user as any).role;

      // Pertahankan role admin; petakan role user menjadi learner.
      // Role yang tidak dikenal tidak diberi akses admin.
      let role: SessionUser["role"];

      if (rawRole === "admin") {
        role = "admin";
      } else if (rawRole === "user" || rawRole === "learner") {
        role = "learner";
      } else {
        return null;
      }

      return {
        id: session.user.id,
        name: session.user.name || "Pembelajar",
        email: session.user.email,
        role,
        goal: (session.user as any).goal,
        dailyTargetMinutes:
          (session.user as any).dailyTargetMinutes || 10,
        level: (session.user as any).level || "Beginner",
      };
    }
  } catch (err) {
    console.error("Gagal mengambil sesi pengguna:", err);
  }

  return null;
}

/**
 * Mengembalikan pengguna yang sudah terautentikasi.
 * Tidak menggunakan akun demo sebagai fallback.
 */
export async function getRequiredUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (user) return user;

  throw new Error("UNAUTHENTICATED");
}
