import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const db = await getDb();
  const currentUser = await getSessionUser();
  const meId = currentUser?.id ?? "";

  let result;
  if (userId) {
    result = await db.execute({
      sql: `SELECT p.*, u.username, u.display_name,
         (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
         (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked_by_me
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC`,
      args: [meId, userId],
    });
  } else {
    result = await db.execute({
      sql: `SELECT p.*, u.username, u.display_name,
         (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
         (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked_by_me
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC
         LIMIT 50`,
      args: [meId],
    });
  }

  return NextResponse.json({ posts: result.rows });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { content } = await request.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json(
      { error: "投稿内容を入力してください" },
      { status: 400 }
    );
  }

  if (content.length > 280) {
    return NextResponse.json(
      { error: "投稿は280文字以内で入力してください" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const id = uuidv4();

  await db.execute({
    sql: "INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)",
    args: [id, user.id, content.trim()],
  });

  return NextResponse.json({ success: true, id });
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const postId = request.nextUrl.searchParams.get("id");
  if (!postId) {
    return NextResponse.json(
      { error: "投稿IDが必要です" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT user_id FROM posts WHERE id = ?",
    args: [postId],
  });

  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: "投稿が見つかりません" },
      { status: 404 }
    );
  }

  if (result.rows[0].user_id !== user.id) {
    return NextResponse.json(
      { error: "この投稿を削除する権限がありません" },
      { status: 403 }
    );
  }

  await db.execute({ sql: "DELETE FROM posts WHERE id = ?", args: [postId] });
  return NextResponse.json({ success: true });
}
