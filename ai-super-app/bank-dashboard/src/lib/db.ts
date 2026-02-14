import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;
let initialized = false;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:bank-dashboard.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function getDb(): Promise<Client> {
  const db = getClient();
  if (!initialized) {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        institution TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('securities', 'bank', 'fund')),
        currency TEXT DEFAULT 'JPY',
        note TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        name TEXT NOT NULL,
        ticker TEXT DEFAULT '',
        asset_type TEXT NOT NULL CHECK(asset_type IN ('stock', 'fund', 'etf', 'bond', 'cash', 'crypto', 'other')),
        quantity REAL NOT NULL DEFAULT 0,
        avg_cost REAL NOT NULL DEFAULT 0,
        current_price REAL NOT NULL DEFAULT 0,
        currency TEXT DEFAULT 'JPY',
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        asset_name TEXT NOT NULL,
        ticker TEXT DEFAULT '',
        type TEXT NOT NULL CHECK(type IN ('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'transfer')),
        quantity REAL DEFAULT 0,
        price REAL DEFAULT 0,
        total REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        total_value REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);
    initialized = true;
  }
  return db;
}
