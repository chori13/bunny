"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

interface ChartDataItem {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

interface SalesChartProps {
  data: ChartDataItem[];
}

type ChartMode = "revenue" | "orders";

export default function SalesChart({ data }: SalesChartProps) {
  const [mode, setMode] = useState<ChartMode>("revenue");

  const values = data.map((d) => (mode === "revenue" ? d.revenue : d.orders));
  const maxValue = Math.max(...values, 1);

  // Show every Nth label to avoid crowding
  const labelInterval = data.length > 15 ? 3 : data.length > 7 ? 2 : 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">최근 30일 추이</h3>
        </div>
        <div className="flex rounded-lg bg-white/5 border border-white/10 p-0.5">
          <button
            onClick={() => setMode("revenue")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "revenue"
                ? "bg-violet-500/20 text-violet-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            매출
          </button>
          <button
            onClick={() => setMode("orders")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "orders"
                ? "bg-violet-500/20 text-violet-400"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            주문수
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-52">
        {/* Y-axis guide lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className="absolute left-0 right-0 border-t border-white/5"
            style={{ bottom: `${ratio * 100}%` }}
          >
            <span className="absolute -top-2.5 -left-1 text-[9px] text-white/20 select-none">
              {mode === "revenue"
                ? `${Math.round((maxValue * ratio) / 1000)}k`
                : Math.round(maxValue * ratio)}
            </span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-[2px] pl-6">
          {data.map((item, i) => {
            const value = mode === "revenue" ? item.revenue : item.orders;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center justify-end group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="rounded-lg bg-[#1a1a1e] border border-white/10 px-3 py-2 text-[10px] whitespace-nowrap shadow-xl">
                    <p className="text-white/50">{item.date}</p>
                    <p className="text-white font-medium">
                      {mode === "revenue"
                        ? `${value.toLocaleString()}원`
                        : `${value}건`}
                    </p>
                  </div>
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-violet-600/60 to-violet-400/40 transition-all duration-300 hover:from-violet-500/80 hover:to-violet-300/60 min-h-[2px]"
                  style={{ height: `${Math.max(height, 1)}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-[2px] pl-6 mt-2">
        {data.map((item, i) => (
          <div key={item.date} className="flex-1 text-center">
            {i % labelInterval === 0 ? (
              <span className="text-[9px] text-white/20">{item.label}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
