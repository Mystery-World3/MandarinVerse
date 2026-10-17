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
      return {
        id: session.user.id,
        name: session.user.name || "Pembelajar",
        email: session.user.email,
        role: (session.user as any).role || "learner",
        goal: (session.user as any).goal,
        dailyTargetMinutes: (session.user as any).dailyTargetMinutes || 10,
        level: (session.user as any).level || "Beginner",
      };
    }
  } catch (err) {
    // Session retrieval error or headers not ready
  }

  return null;
}

/**
 * Returns the authenticated user or throws a 401-compatible error.
 * In production, there is NO demo-user fallback — every caller must handle null.
 * Use getCurrentUser() and return a 401 response directly in route handlers instead.
 */
export async function getRequiredUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user) return user;

  throw new Error("UNAUTHENTICATED");
}
