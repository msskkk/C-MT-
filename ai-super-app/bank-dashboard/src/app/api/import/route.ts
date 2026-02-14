import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";
import { parseRakutenHoldings, parseRakutenTransactions } from "@/lib/csv-parser";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { account_id, csv_text, import_type } = body;

  if (!account_id || !csv_text) {
    return NextResponse.json({ error: "account_id と csv_text は必須です" }, { status: 400 });
  }

  const db = await getDb();

  if (import_type === "transactions") {
    const txns = parseRakutenTransactions(csv_text);
    if (txns.length === 0) {
      return NextResponse.json({ error: "取引データが見つかりません。CSV形式を確認してください。" }, { status: 400 });
    }

    for (const txn of txns) {
      await db.execute({
        sql: `INSERT INTO transactions (id, account_id, asset_name, ticker, type, quantity, price, total, date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [uuid(), account_id, txn.assetName, txn.ticker, txn.type, txn.quantity, txn.price, txn.total, txn.date],
      });
    }

    return NextResponse.json({ imported: txns.length, type: "transactions" });
  } else {
    // Default: holdings import
    const assets = parseRakutenHoldings(csv_text);
    if (assets.length === 0) {
      return NextResponse.json({ error: "資産データが見つかりません。CSV形式を確認してください。" }, { status: 400 });
    }

    // Clear existing assets for this account before import
    await db.execute({ sql: "DELETE FROM assets WHERE account_id = ?", args: [account_id] });

    for (const asset of assets) {
      await db.execute({
        sql: `INSERT INTO assets (id, account_id, name, ticker, asset_type, quantity, avg_cost, current_price, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [uuid(), account_id, asset.name, asset.ticker, asset.assetType, asset.quantity, asset.avgCost, asset.currentPrice],
      });
    }

    // Take a snapshot
    const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
    await db.execute({
      sql: "INSERT INTO snapshots (id, account_id, total_value, date) VALUES (?, ?, ?, date('now'))",
      args: [uuid(), account_id, totalValue],
    });

    return NextResponse.json({ imported: assets.length, type: "holdings", totalValue });
  }
}
