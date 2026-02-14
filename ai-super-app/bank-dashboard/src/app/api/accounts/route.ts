import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM accounts ORDER BY created_at DESC");
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, institution, type, currency, note } = body;

  if (!name || !institution || !type) {
    return NextResponse.json({ error: "name, institution, type は必須です" }, { status: 400 });
  }

  const db = await getDb();
  const id = uuid();
  await db.execute({
    sql: "INSERT INTO accounts (id, name, institution, type, currency, note) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, name, institution, type, currency || "JPY", note || ""],
  });

  return NextResponse.json({ id, name, institution, type });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM accounts WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
