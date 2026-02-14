import { cookies } from "next/headers";
import { getDb } from "./db";

const SESSION_COOKIE = "sns_session";

interface SessionUser {
  id: string;
  username: string;
  display_name: string;
  bio: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionValue) return null;

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id, username, display_name, bio FROM users WHERE id = ?",
    args: [sessionValue],
  });

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id as string,
    username: row.username as string,
    display_name: row.display_name as string,
    bio: (row.bio as string) ?? "",
  };
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
