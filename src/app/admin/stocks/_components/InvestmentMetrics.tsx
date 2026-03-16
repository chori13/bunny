"use client";

import type { UnifiedStockData } from "@/types/stock";

export default function InvestmentMetrics({ data }: { data: UnifiedStockData }) {
  const metrics = [
    {
      label: "PER",
      value: data.per,
      format: (v: number) => v.toFixed(2) + "x",
      description: "주가수익비율",
      color: getPerColor(data.per),
    },
    {
      label: "PBR",
      value: data.pbr,
      format: (v: number) => v.toFixed(2) + "x",
      description: "주가순자산비율",
      color: getPbrColor(data.pbr),
    },
    {
      label: "EPS",
      value: data.eps,
      format: (v: number) =>
        data.currency === "KRW"
          ? v.toLocaleString("ko-KR") + "원"
          : "$" + v.toFixed(2),
      description: "주당순이익",
      color: data.eps && data.eps > 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "ROE",
      value: data.roe,
      format: (v: number) => (v * 100).toFixed(2) + "%",
      description: "자기자본이익률",
      color: data.roe && data.roe > 0.15 ? "text-emerald-400" : data.roe && data.roe > 0.08 ? "text-amber-400" : "text-red-400",
    },
    {
      label: "배당수익률",
      value: data.dividendYield,
      format: (v: number) => (v * 100).toFixed(2) + "%",
      description: "Dividend Yield",
      color: data.dividendYield && data.dividendYield > 0.03 ? "text-emerald-400" : "text-white/60",
    },
    {
      label: "Beta",
      value: data.beta,
      format: (v: number) => v.toFixed(2),
      description: "시장 변동성 대비",
      color: data.beta && data.beta > 1.2 ? "text-red-400" : data.beta && data.beta < 0.8 ? "text-blue-400" : "text-white/60",
    },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold text-white/60 mb-3">투자 지표</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="px-3 py-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/25">{m.description}</span>
            </div>
            <p className="text-xs font-bold text-white/40 mb-0.5">{m.label}</p>
            <p className={`text-lg font-bold ${m.value !== null ? m.color : "text-white/15"}`}>
              {m.value !== null ? m.format(m.value) : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getPerColor(per: number | null) {
  if (per === null) return "text-white/60";
  if (per < 0) return "text-red-400";
  if (per < 10) return "text-emerald-400";
  if (per < 20) return "text-amber-400";
  return "text-red-400";
}

function getPbrColor(pbr: number | null) {
  if (pbr === null) return "text-white/60";
  if (pbr < 1) return "text-emerald-400";
  if (pbr < 3) return "text-amber-400";
  return "text-red-400";
}