"use client";

import { useEffect, useState } from "react";
import AssetCard from "@/components/AssetCard";
import AllocationBar, { getSegmentColor } from "@/components/AllocationBar";

interface Asset {
  id: string;
  account_id: string;
  name: string;
  ticker: string;
  asset_type: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  account_name: string;
  institution: string;
}

interface Account {
  id: string;
  name: string;
  institution: string;
  type: string;
}

function formatJPY(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}億円`;
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}万円`;
  return `${Math.round(n).toLocaleString()}円`;
}

function formatPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/assets").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]).then(([a, ac]) => {
      setAssets(a);
      setAccounts(ac);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const totalValue = assets.reduce((sum, a) => sum + a.quantity * a.current_price, 0);
  const totalCost = assets.reduce((sum, a) => sum + a.quantity * a.avg_cost, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Group by account
  const byAccount = accounts.map((acc) => {
    const accAssets = assets.filter((a) => a.account_id === acc.id);
    const value = accAssets.reduce((sum, a) => sum + a.quantity * a.current_price, 0);
    const cost = accAssets.reduce((sum, a) => sum + a.quantity * a.avg_cost, 0);
    return { ...acc, assets: accAssets, value, cost, pnl: value - cost };
  });

  // Allocation by account
  const accountSegments = byAccount
    .filter((a) => a.value > 0)
    .map((a, i) => ({
      label: `${a.name} (${a.institution})`,
      value: a.value,
      color: getSegmentColor(i),
    }));

  // Allocation by asset type
  const typeMap: Record<string, number> = {};
  assets.forEach((a) => {
    const val = a.quantity * a.current_price;
    typeMap[a.asset_type] = (typeMap[a.asset_type] || 0) + val;
  });
  const typeLabels: Record<string, string> = {
    stock: "株式",
    fund: "投資信託",
    etf: "ETF",
    bond: "債券",
    cash: "現金",
    crypto: "暗号資産",
    other: "その他",
  };
  const typeSegments = Object.entries(typeMap).map(([key, val], i) => ({
    label: typeLabels[key] || key,
    value: val,
    color: getSegmentColor(i),
  }));

  const isEmpty = assets.length === 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">ダッシュボード</h2>

      {isEmpty ? (
        <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-10 text-center">
          <p className="text-4xl mb-3">🏦</p>
          <p className="text-gray-300 font-medium mb-2">まだ資産データがありません</p>
          <p className="text-gray-500 text-sm">
            「口座管理」で口座を追加し、「CSVインポート」または「手動入力」でデータを登録してください
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AssetCard label="総資産額" value={formatJPY(totalValue)} color="blue" />
            <AssetCard
              label="損益"
              value={formatJPY(totalPnL)}
              sub={formatPct(totalPnLPct)}
              color={totalPnL >= 0 ? "green" : "red"}
            />
            <AssetCard label="口座数" value={`${accounts.length}`} color="purple" />
            <AssetCard label="銘柄数" value={`${assets.length}`} color="orange" />
          </div>

          {/* Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4">口座別配分</h3>
              <AllocationBar segments={accountSegments} />
            </div>
            <div className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4">資産種別配分</h3>
              <AllocationBar segments={typeSegments} />
            </div>
          </div>

          {/* Per-account breakdown */}
          <h3 className="text-lg font-bold text-white mb-4">口座別詳細</h3>
          <div className="space-y-4">
            {byAccount.map((acc) => (
              <div key={acc.id} className="bg-[#1a1d27] rounded-xl border border-gray-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-medium">{acc.name}</span>
                    <span className="text-gray-500 text-sm ml-2">{acc.institution}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold">{formatJPY(acc.value)}</span>
                    <span
                      className={`text-sm ml-2 ${acc.pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {formatJPY(acc.pnl)} ({acc.cost > 0 ? formatPct((acc.pnl / acc.cost) * 100) : "—"})
                    </span>
                  </div>
                </div>
                {acc.assets.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left pb-2 font-normal">銘柄</th>
                        <th className="text-right pb-2 font-normal">数量</th>
                        <th className="text-right pb-2 font-normal">現在値</th>
                        <th className="text-right pb-2 font-normal">評価額</th>
                        <th className="text-right pb-2 font-normal">損益</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acc.assets.map((asset) => {
                        const val = asset.quantity * asset.current_price;
                        const cost = asset.quantity * asset.avg_cost;
                        const pnl = val - cost;
                        return (
                          <tr key={asset.id} className="border-b border-gray-800/50">
                            <td className="py-2 text-gray-200">
                              {asset.name}
                              {asset.ticker && (
                                <span className="text-gray-500 text-xs ml-1">{asset.ticker}</span>
                              )}
                            </td>
                            <td className="py-2 text-right text-gray-300">
                              {asset.quantity.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-gray-300">
                              {asset.current_price.toLocaleString()}
                            </td>
                            <td className="py-2 text-right text-white font-medium">
                              {formatJPY(val)}
                            </td>
                            <td
                              className={`py-2 text-right ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {formatJPY(pnl)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
