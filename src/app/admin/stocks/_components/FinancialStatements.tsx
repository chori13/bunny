"use client";

import { useState } from "react";
import type { UnifiedStockData } from "@/types/stock";

type Tab = "revenue" | "operatingIncome" | "netIncome" | "totalAssets";

const tabs: { id: Tab; label: string }[] = [
  { id: "revenue", label: "매출" },
  { id: "operatingIncome", label: "영업이익" },
  { id: "netIncome", label: "순이익" },
  { id: "totalAssets", label: "총자산" },
];

export default function FinancialStatements({ data }: { data: UnifiedStockData }) {
  const [activeTab, setActiveTab] = useState<Tab>("revenue");
  const items = data.financials[activeTab] || [];
  const maxValue = Math.max(...items.map((i) => Math.abs(i.value)), 1);

  const formatValue = (v: number) => {
    const abs = Math.abs(v);
    if (data.currency === "KRW") {
      if (abs >= 1e12) return (v / 1e12).toFixed(1) + "조";
      if (abs >= 1e8) return (v / 1e8).toFixed(0) + "억";
      return v.toLocaleString();
    }
    if (abs >= 1e9) return "$" + (v / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
    return "$" + v.toLocaleString();
  };

  const hasData = items.length > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold text-white/60 mb-3">재무제표</h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-violet-500/20 text-violet-400"
                : "text-white/30 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="space-y-2">
          {items.map((item) => {
            const pct = (Math.abs(item.value) / maxValue) * 100;
            const isNeg = item.value < 0;
            return (
              <div key={item.year} className="flex items-center gap-3">
                <span className="text-xs text-white/30 min-w-[40px] text-right font-mono">{item.year}</span>
                <div className="flex-1 h-7 rounded-lg bg-black/20 overflow-hidden relative">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${
                      isNeg
                        ? "bg-gradient-to-r from-red-500/40 to-red-500/20"
                        : "bg-gradient-to-r from-violet-500/40 to-indigo-500/30"
                    }`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-white/50">
                    {formatValue(item.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/20 text-center py-6">재무 데이터가 없습니다</p>
      )}
    </div>
  );
}