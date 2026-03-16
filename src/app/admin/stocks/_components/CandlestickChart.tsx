"use client";

import { useEffect, useRef, useState } from "react";
import type { UnifiedStockData } from "@/types/stock";

const periods = [
  { label: "1주", value: "1w" },
  { label: "1개월", value: "1m" },
  { label: "3개월", value: "3m" },
  { label: "1년", value: "1y" },
  { label: "5년", value: "5y" },
];

interface CandlestickChartProps {
  data: UnifiedStockData;
  onPeriodChange: (period: string) => void;
  currentPeriod: string;
}

export default function CandlestickChart({ data, onPeriodChange, currentPeriod }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || data.candles.length === 0) return;

    let cancelled = false;

    (async () => {
      const { createChart, CandlestickSeries, HistogramSeries } = await import("lightweight-charts");
      if (cancelled || !containerRef.current) return;

      // Cleanup previous chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(255,255,255,0.3)",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.03)" },
          horzLines: { color: "rgba(255,255,255,0.03)" },
        },
        crosshair: {
          vertLine: { color: "rgba(139,92,246,0.3)", labelBackgroundColor: "#7c3aed" },
          horzLine: { color: "rgba(139,92,246,0.3)", labelBackgroundColor: "#7c3aed" },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.05)",
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.05)",
          timeVisible: false,
        },
      });

      chartRef.current = chart;

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e80",
        wickDownColor: "#ef444480",
      });

      candleSeries.setData(
        data.candles.map((c) => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );

      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });

      volumeSeries.setData(
        data.candles.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
        }))
      );

      chart.timeScale().fitContent();

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0] && chartRef.current) {
          chartRef.current.applyOptions({ width: entries[0].contentRect.width });
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    })();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [mounted, data.candles]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white/60">차트</h3>
        <div className="flex items-center gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                currentPeriod === p.value
                  ? "bg-violet-500/20 text-violet-400"
                  : "text-white/30 hover:bg-white/5 hover:text-white/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-3">
        {data.candles.length > 0 ? (
          <div ref={containerRef} />
        ) : (
          <div className="flex items-center justify-center h-[400px] text-white/20 text-sm">
            차트 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  );
}
