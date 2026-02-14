import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getSessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const { username, password, displayName } = await request.json();

  if (!username || !password || !displayName) {
    return NextResponse.json(
      { error: "全てのフィールドを入力してください" },
      { status: 400 }
    );
  }

  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { error: "ユーザー名は3〜20文字で入力してください" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "パスワードは6文字以上で入力してください" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE username = ?",
    args: [username],
  });

  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "このユーザー名は既に使用されています" },
      { status: 409 }
    );
  }

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);

  await db.execute({
    sql: "INSERT INTO users (id, username, display_name, password_hash) VALUES (?, ?, ?, ?)",
    args: [id, username, displayName, passwordHash],
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
