"use client";

import { useEffect, useState } from "react";

interface Account {
  id: string;
  name: string;
  institution: string;
  type: string;
  currency: string;
  note: string;
}

const INSTITUTIONS = [
  "楽天証券",
  "モルガン・スタンレー",
  "三菱UFJ銀行",
  "SBI証券",
  "野村證券",
  "大和証券",
  "みずほ銀行",
  "三井住友銀行",
  "その他",
];

const ACCOUNT_TYPES = [
  { value: "securities", label: "証券口座" },
  { value: "bank", label: "銀行口座" },
  { value: "fund", label: "ファンド" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState(INSTITUTIONS[0]);
  const [type, setType] = useState("securities");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadAccounts = () => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then(setAccounts);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, institution, type, note }),
    });
    setName("");
    setNote("");
    setShowForm(false);
    setSaving(false);
    loadAccounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この口座を削除しますか？関連する資産・取引データもすべて削除されます。")) return;
    await fetch(`/api/accounts?id=${id}`, { method: "DELETE" });
    loadAccounts();
  };

  const typeLabel = (t: string) => ACCOUNT_TYPES.find((at) => at.value === t)?.label || t;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">口座管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          {showForm ? "キャンセル" : "+ 口座を追加"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5 mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">口座名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 楽天証券（特定口座）"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">金融機関</label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {INSTITUTIONS.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">口座種別</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {ACCOUNT_TYPES.map((at) => (
                  <option key={at.value} value={at.value}>
                    {at.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">メモ</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="任意のメモ"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            {saving ? "保存中..." : "追加"}
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-10 text-center">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-gray-300 font-medium mb-2">口座が登録されていません</p>
          <p className="text-gray-500 text-sm">「+ 口座を追加」から口座を登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#1a1d27] rounded-xl border border-gray-800 p-4 flex items-center justify-between"
            >
              <div>
                <span className="text-white font-medium">{acc.name}</span>
                <span className="text-gray-500 text-sm ml-2">{acc.institution}</span>
                <span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {typeLabel(acc.type)}
                </span>
                {acc.note && <span className="text-gray-600 text-xs ml-2">{acc.note}</span>}
              </div>
              <button
                onClick={() => handleDelete(acc.id)}
                className="text-gray-600 hover:text-red-400 text-sm transition-colors"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
