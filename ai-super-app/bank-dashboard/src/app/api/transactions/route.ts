import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");
  const limit = parseInt(searchParams.get("limit") || "50");

  const db = await getDb();
  let result;
  if (accountId) {
    result = await db.execute({
      sql: "SELECT t.*, a.name as account_name FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.account_id = ? ORDER BY t.date DESC LIMIT ?",
      args: [accountId, limit],
    });
  } else {
    result = await db.execute({
      sql: "SELECT t.*, a.name as account_name FROM transactions t JOIN accounts a ON t.account_id = a.id ORDER BY t.date DESC LIMIT ?",
      args: [limit],
    });
  }
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, asset_name, ticker, type, quantity, price, total, date, note } = body;

  if (!account_id || !asset_name || !type || total === undefined || !date) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const db = await getDb();
  const id = uuid();
  await db.execute({
    sql: `INSERT INTO transactions (id, account_id, asset_name, ticker, type, quantity, price, total, date, note)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, account_id, asset_name, ticker || "", type, quantity || 0, price || 0, total, date, note || ""],
  });

  return NextResponse.json({ id });
}
