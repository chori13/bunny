"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { UnifiedStockData } from "@/types/stock";

export default function StockOverviewCard({ data }: { data: UnifiedStockData }) {
  const isUp = (data.change ?? 0) > 0;
  const isDown = (data.change ?? 0) < 0;

  const formatPrice = (v: number | null) => {
    if (v === null) return "-";
    if (data.currency === "KRW") return v.toLocaleString("ko-KR") + "원";
    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatLargeNumber = (v: number | null) => {
    if (v === null) return "-";
    if (data.currency === "KRW") {
      if (v >= 1e12) return (v / 1e12).toFixed(1) + "조";
      if (v >= 1e8) return (v / 1e8).toFixed(0) + "억";
      return v.toLocaleString();
    }
    if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
    if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
    return "$" + v.toLocaleString();
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      {/* Top: Name & Price */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white">{data.name}</h2>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-mono text-white/30">
              {data.symbol}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span>{data.exchange}</span>
            <span>·</span>
            <span>{data.currency}</span>
            {data.sources.length > 0 && (
              <>
                <span>·</span>
                <span className="text-violet-400/50">
                  {data.sources.join(" + ")}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatPrice(data.currentPrice)}</p>
          <div className={`flex items-center justify-end gap-1 mt-0.5 ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-white/40"}`}>
            {isUp ? <TrendingUp size={14} /> : isDown ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span className="text-sm font-semibold">
              {isUp ? "+" : ""}{data.change?.toLocaleString() ?? "-"}
            </span>
            <span className="text-sm">
              ({isUp ? "+" : ""}{data.changePercent?.toFixed(2) ?? "-"}%)
            </span>
          </div>
        </div>
      </div>

      {/* Price Detail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="시가" value={formatPrice(data.open)} />
        <MiniStat label="고가" value={formatPrice(data.dayHigh)} color="text-emerald-400/70" />
        <MiniStat label="저가" value={formatPrice(data.dayLow)} color="text-red-400/70" />
        <MiniStat label="전일종가" value={formatPrice(data.previousClose)} />
        <MiniStat label="52주 최고" value={formatPrice(data.week52High)} color="text-emerald-400/70" />
        <MiniStat label="52주 최저" value={formatPrice(data.week52Low)} color="text-red-400/70" />
        <MiniStat label="거래량" value={data.volume?.toLocaleString() ?? "-"} />
        <MiniStat label="시가총액" value={formatLargeNumber(data.marketCap)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-black/20 border border-white/5">
      <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${color || "text-white/70"}`}>{value}</p>
    </div>
  );
}