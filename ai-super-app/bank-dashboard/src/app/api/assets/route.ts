import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");

  const db = await getDb();
  let result;
  if (accountId) {
    result = await db.execute({
      sql: "SELECT a.*, ac.name as account_name, ac.institution FROM assets a JOIN accounts ac ON a.account_id = ac.id WHERE a.account_id = ? ORDER BY (a.quantity * a.current_price) DESC",
      args: [accountId],
    });
  } else {
    result = await db.execute(
      "SELECT a.*, ac.name as account_name, ac.institution FROM assets a JOIN accounts ac ON a.account_id = ac.id ORDER BY (a.quantity * a.current_price) DESC"
    );
  }
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, name, ticker, asset_type, quantity, avg_cost, current_price, currency } = body;

  if (!account_id || !name || !asset_type) {
    return NextResponse.json({ error: "account_id, name, asset_type は必須です" }, { status: 400 });
  }

  const db = await getDb();
  const id = uuid();
  await db.execute({
    sql: `INSERT INTO assets (id, account_id, name, ticker, asset_type, quantity, avg_cost, current_price, currency, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [id, account_id, name, ticker || "", asset_type, quantity || 0, avg_cost || 0, current_price || 0, currency || "JPY"],
  });

  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, quantity, avg_cost, current_price } = body;

  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({
    sql: `UPDATE assets SET quantity = ?, avg_cost = ?, current_price = ?, updated_at = datetime('now') WHERE id = ?`,
    args: [quantity, avg_cost, current_price, id],
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM assets WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
