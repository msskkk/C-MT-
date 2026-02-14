import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { targetUserId } = await request.json();

  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "自分自身をフォローすることはできません" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?",
    args: [user.id, targetUserId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      args: [user.id, targetUserId],
    });
    return NextResponse.json({ following: false });
  }

  const id = uuidv4();
  await db.execute({
    sql: "INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)",
    args: [id, user.id, targetUserId],
  });

  return NextResponse.json({ following: true });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  const db = await getDb();
  const currentUser = await getSessionUser();

  const followers = await db.execute({
    sql: "SELECT COUNT(*) as count FROM follows WHERE following_id = ?",
    args: [userId],
  });

  const following = await db.execute({
    sql: "SELECT COUNT(*) as count FROM follows WHERE follower_id = ?",
    args: [userId],
  });

  let isFollowing = false;
  if (currentUser) {
    const follow = await db.execute({
      sql: "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?",
      args: [currentUser.id, userId],
    });
    isFollowing = follow.rows.length > 0;
  }

  return NextResponse.json({
    followers: followers.rows[0].count,
    following: following.rows[0].count,
    isFollowing,
  });
}
