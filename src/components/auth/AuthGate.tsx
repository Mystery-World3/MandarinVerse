"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isPending && !session?.user && !isPublicPath) {
      router.replace(`/login?callbackURL=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, isPublicPath, pathname, router]);

  if (!isPublicPath && (isPending || !session?.user)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fbfbfa] text-slate-700">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Memeriksa sesi akun Anda...</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
