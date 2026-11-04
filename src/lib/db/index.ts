import { neon } from "@neondatabase/serverless";

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres"));
}

export function getDbClient() {
  if (!isPostgresConfigured()) {
    return null;
  }
  // Di Edge, kita gunakan HTTP call (neon) bukan Pool
  return neon(process.env.DATABASE_URL!);
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const sql = getDbClient();
  if (!sql) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }
  const res = await sql(text, params);
  return res as unknown as T[];
}