"use client";

import { useEffect, useState } from "react";
import CsvDropzone from "@/components/CsvDropzone";

interface Account {
  id: string;
  name: string;
  institution: string;
}

export default function ImportPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [importType, setImportType] = useState<"holdings" | "transactions">("holdings");
  const [csvText, setCsvText] = useState<string | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data);
        if (data.length > 0) setSelectedAccount(data[0].id);
      });
  }, []);

  const handleFileLoaded = (text: string, fileName: string) => {
    setCsvText(text);
    setCsvFileName(fileName);
    setResult(null);
    setError(null);
  };

  const handleImport = async () => {
    if (!selectedAccount || !csvText) return;
    setImporting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccount,
          csv_text: csvText,
          import_type: importType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "インポートに失敗しました");
      } else {
        if (data.type === "holdings") {
          setResult(
            `${data.imported}件の資産を取り込みました（評価額合計: ${Math.round(data.totalValue).toLocaleString()}円）`
          );
        } else {
          setResult(`${data.imported}件の取引を取り込みました`);
        }
        setCsvText(null);
        setCsvFileName(null);
      }
    } catch {
      setError("インポート処理中にエラーが発生しました");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">CSVインポート</h2>

      {accounts.length === 0 ? (
        <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-10 text-center">
          <p className="text-gray-300 font-medium mb-2">先に口座を登録してください</p>
          <p className="text-gray-500 text-sm">「口座管理」から口座を追加してください</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">取込先口座</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}（{acc.institution}）
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">取込種別</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as "holdings" | "transactions")}
                  className="w-full bg-[#0f1117] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="holdings">保有資産</option>
                  <option value="transactions">取引履歴</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dropzone */}
          <CsvDropzone onFileLoaded={handleFileLoaded} />

          {/* Import button */}
          {csvText && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors font-medium"
              >
                {importing ? "インポート中..." : "インポート実行"}
              </button>
              <span className="text-gray-500 text-sm">{csvFileName}</span>
            </div>
          )}

          {/* Result / Error */}
          {result && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
              {result}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Help */}
          <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-3">対応CSV形式</h3>
            <div className="text-xs text-gray-500 space-y-2">
              <p>
                <span className="text-gray-400 font-medium">楽天証券 保有資産:</span>{" "}
                マイメニュー → 保有商品一覧 → CSVダウンロード
              </p>
              <p>
                <span className="text-gray-400 font-medium">楽天証券 取引履歴:</span>{" "}
                マイメニュー → 取引履歴 → CSVダウンロード
              </p>
              <p>
                <span className="text-gray-400 font-medium">汎用CSV:</span>{" "}
                ヘッダに「銘柄名」「数量」「現在値」等を含むCSVであれば自動認識します
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
