import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { postId } = await request.json();
  const db = await getDb();

  const existing = await db.execute({
    sql: "SELECT id FROM likes WHERE user_id = ? AND post_id = ?",
    args: [user.id, postId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
      args: [user.id, postId],
    });
    return NextResponse.json({ liked: false });
  }

  const id = uuidv4();
  await db.execute({
    sql: "INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)",
    args: [id, user.id, postId],
  });

  return NextResponse.json({ liked: true });
}

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM likes WHERE post_id = ?",
    args: [postId],
  });

  return NextResponse.json({ count: result.rows[0].count });
}
