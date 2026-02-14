export interface ParsedAsset {
  name: string;
  ticker: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  assetType: "stock" | "fund" | "etf" | "bond" | "cash" | "other";
}

export interface ParsedTransaction {
  assetName: string;
  ticker: string;
  type: "buy" | "sell" | "dividend";
  quantity: number;
  price: number;
  total: number;
  date: string;
}

function parseCSVLines(text: string): string[][] {
  const lines = text.trim().split("\n");
  return lines.map((line) =>
    line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
  );
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex(
      (h) => h.includes(candidate) || candidate.includes(h)
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

// 楽天証券の保有資産CSV
export function parseRakutenHoldings(text: string): ParsedAsset[] {
  const rows = parseCSVLines(text);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const codeIdx = findColumnIndex(headers, ["銘柄コード", "コード", "ティッカー"]);
  const nameIdx = findColumnIndex(headers, ["銘柄", "銘柄名", "ファンド名"]);
  const qtyIdx = findColumnIndex(headers, ["保有数量", "数量", "口数", "保有株数"]);
  const costIdx = findColumnIndex(headers, ["取得単価", "平均取得価額", "取得価格"]);
  const priceIdx = findColumnIndex(headers, ["現在値", "基準価額", "時価", "評価単価"]);

  const assets: ParsedAsset[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const ticker = codeIdx >= 0 ? row[codeIdx] : "";
    const name = nameIdx >= 0 ? row[nameIdx] : row[0];
    const quantity = qtyIdx >= 0 ? parseFloat(row[qtyIdx].replace(/,/g, "")) || 0 : 0;
    const avgCost = costIdx >= 0 ? parseFloat(row[costIdx].replace(/,/g, "")) || 0 : 0;
    const currentPrice = priceIdx >= 0 ? parseFloat(row[priceIdx].replace(/,/g, "")) || 0 : 0;

    if (!name || name === "") continue;

    assets.push({
      name,
      ticker,
      quantity,
      avgCost,
      currentPrice,
      assetType: ticker.match(/^\d{4}$/) ? "stock" : "fund",
    });
  }

  return assets;
}

// 楽天証券の取引履歴CSV
export function parseRakutenTransactions(text: string): ParsedTransaction[] {
  const rows = parseCSVLines(text);
  if (rows.length < 2) return [];

  const headers = rows[0];
  const dateIdx = findColumnIndex(headers, ["約定日", "受渡日", "日付"]);
  const nameIdx = findColumnIndex(headers, ["銘柄", "銘柄名"]);
  const codeIdx = findColumnIndex(headers, ["銘柄コード", "コード"]);
  const typeIdx = findColumnIndex(headers, ["売買区分", "取引区分", "売買"]);
  const qtyIdx = findColumnIndex(headers, ["数量", "株数", "約定数量"]);
  const priceIdx = findColumnIndex(headers, ["単価", "約定単価", "約定価格"]);
  const totalIdx = findColumnIndex(headers, ["約定代金", "受渡金額", "金額"]);

  const txns: ParsedTransaction[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const rawType = typeIdx >= 0 ? row[typeIdx] : "";
    let type: "buy" | "sell" | "dividend" = "buy";
    if (rawType.includes("売") || rawType.toLowerCase().includes("sell")) type = "sell";
    else if (rawType.includes("配当") || rawType.includes("分配")) type = "dividend";

    const dateRaw = dateIdx >= 0 ? row[dateIdx] : "";
    const date = dateRaw.replace(/\//g, "-");

    txns.push({
      assetName: nameIdx >= 0 ? row[nameIdx] : row[0],
      ticker: codeIdx >= 0 ? row[codeIdx] : "",
      type,
      quantity: qtyIdx >= 0 ? parseFloat(row[qtyIdx].replace(/,/g, "")) || 0 : 0,
      price: priceIdx >= 0 ? parseFloat(row[priceIdx].replace(/,/g, "")) || 0 : 0,
      total: totalIdx >= 0 ? parseFloat(row[totalIdx].replace(/,/g, "")) || 0 : 0,
      date,
    });
  }

  return txns;
}

// 汎用CSVパーサー（カラム名を自動マッピング）
export function parseGenericHoldings(text: string): ParsedAsset[] {
  return parseRakutenHoldings(text);
}
