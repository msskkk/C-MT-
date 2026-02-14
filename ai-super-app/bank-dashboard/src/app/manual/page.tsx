"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  name: string;
  institution: string;
}

const ASSET_TYPES = [
  { value: "stock", label: "株式" },
  { value: "fund", label: "投資信託" },
  { value: "etf", label: "ETF" },
  { value: "bond", label: "債券" },
  { value: "cash", label: "現金" },
  { value: "crypto", label: "暗号資産" },
  { value: "other", label: "その他" },
];

const TXN_TYPES = [
  { value: "buy", label: "買い" },
  { value: "sell", label: "売り" },
  { value: "dividend", label: "配当・分配金" },
  { value: "deposit", label: "入金" },
  { value: "withdrawal", label: "出金" },
  { value: "transfer", label: "振替" },
];

export default function ManualPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tab, setTab] = useState<"asset" | "transaction">("asset");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Asset form
  const [aAccountId, setAAccountId] = useState("");
  const [aName, setAName] = useState("");
  const [aTicker, setATicker] = useState("");
  const [aType, setAType] = useState("stock");
  const [aQty, setAQty] = useState("");
  const [aCost, setACost] = useState("");
  const [aPrice, setAPrice] = useState("");

  // Transaction form
  const [tAccountId, setTAccountId] = useState("");
  const [tAssetName, setTAssetName] = useState("");
  const [tTicker, setTTicker] = useState("");
  const [tType, setTType] = useState("buy");
  const [tQty, setTQty] = useState("");
  const [tPrice, setTPrice] = useState("");
  const [tTotal, setTTotal] = useState("");
  const [tDate, setTDate] = useState(new Date().toISOString().slice(0, 10));
  const [tNote, setTNote] = useState("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data);
        if (data.length > 0) {
          setAAccountId(data[0].id);
          setTAccountId(data[0].id);
        }
      });
  }, []);

  const submitAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: aAccountId,
          name: aName,
          ticker: aTicker,
          asset_type: aType,
          quantity: parseFloat(aQty) || 0,
          avg_cost: parseFloat(aCost) || 0,
          current_price: parseFloat(aPrice) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "ok", text: `${aName} を登録しました` });
      setAName("");
      setATicker("");
      setAQty("");
      setACost("");
      setAPrice("");
    } catch {
      setMessage({ type: "err", text: "登録に失敗しました" });
    } finally {
      setSaving(false);
    }
  };

  const submitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: tAccountId,
          asset_name: tAssetName,
          ticker: tTicker,
          type: tType,
          quantity: parseFloat(tQty) || 0,
          price: parseFloat(tPrice) || 0,
          total: parseFloat(tTotal) || 0,
          date: tDate,
          note: tNote,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: "ok", text: "取引を登録しました" });
      setTAssetName("");
      setTTicker("");
      setTQty("");
      setTPrice("");
      setTTotal("");
      setTNote("");
    } catch {
      setMessage({ type: "err", text: "登録に失敗しました" });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none";

  if (accounts.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-6">手動入力</h2>
        <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-10 text-center">
          <p className="text-gray-300 font-medium mb-2">先に口座を登録してください</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">手動入力</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setTab("asset");
            setMessage(null);
          }}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "asset"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-200"
          }`}
        >
          資産を追加
        </button>
        <button
          onClick={() => {
            setTab("transaction");
            setMessage(null);
          }}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            tab === "transaction"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-gray-200"
          }`}
        >
          取引を記録
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "ok"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {tab === "asset" ? (
        <form onSubmit={submitAsset} className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">口座</label>
              <select value={aAccountId} onChange={(e) => setAAccountId(e.target.value)} className={inputClass}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}（{a.institution}）
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">資産種別</label>
              <select value={aType} onChange={(e) => setAType(e.target.value)} className={inputClass}>
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">銘柄名 *</label>
              <input
                type="text"
                value={aName}
                onChange={(e) => setAName(e.target.value)}
                placeholder="例: トヨタ自動車"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ティッカー / コード</label>
              <input
                type="text"
                value={aTicker}
                onChange={(e) => setATicker(e.target.value)}
                placeholder="例: 7203"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">保有数量</label>
              <input
                type="number"
                step="any"
                value={aQty}
                onChange={(e) => setAQty(e.target.value)}
                placeholder="100"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">取得単価</label>
              <input
                type="number"
                step="any"
                value={aCost}
                onChange={(e) => setACost(e.target.value)}
                placeholder="2500"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">現在値</label>
              <input
                type="number"
                step="any"
                value={aPrice}
                onChange={(e) => setAPrice(e.target.value)}
                placeholder="2700"
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium"
          >
            {saving ? "保存中..." : "資産を追加"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitTransaction} className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">口座</label>
              <select value={tAccountId} onChange={(e) => setTAccountId(e.target.value)} className={inputClass}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}（{a.institution}）
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">取引種別</label>
              <select value={tType} onChange={(e) => setTType(e.target.value)} className={inputClass}>
                {TXN_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">銘柄名 *</label>
              <input
                type="text"
                value={tAssetName}
                onChange={(e) => setTAssetName(e.target.value)}
                placeholder="例: トヨタ自動車"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ティッカー / コード</label>
              <input
                type="text"
                value={tTicker}
                onChange={(e) => setTTicker(e.target.value)}
                placeholder="例: 7203"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">数量</label>
              <input
                type="number"
                step="any"
                value={tQty}
                onChange={(e) => setTQty(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">単価</label>
              <input
                type="number"
                step="any"
                value={tPrice}
                onChange={(e) => setTPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">合計金額 *</label>
              <input
                type="number"
                step="any"
                value={tTotal}
                onChange={(e) => setTTotal(e.target.value)}
                placeholder="250000"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">日付 *</label>
              <input
                type="date"
                value={tDate}
                onChange={(e) => setTDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">メモ</label>
              <input
                type="text"
                value={tNote}
                onChange={(e) => setTNote(e.target.value)}
                placeholder="任意のメモ"
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium"
          >
            {saving ? "保存中..." : "取引を記録"}
          </button>
        </form>
      )}
    </div>
  );
}
