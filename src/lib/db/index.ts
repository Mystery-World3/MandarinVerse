import { neon } from "@neondatabase/serverless";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function getDatabaseUrl(): string | undefined {
  try {
    const { env } = getCloudflareContext();
    return (env as any).DATABASE_URL;
  } catch {
    return process.env.DATABASE_URL;
  }
}

export function isPostgresConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(url && url.startsWith("postgres"));
}

export function getDbClient() {
  if (!isPostgresConfigured()) {
    return null;
  }
  return neon(getDatabaseUrl()!);
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const sql = getDbClient();
  if (!sql) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }
  const res = await (sql as any)(text, params);
  return res as unknown as T[];
}
