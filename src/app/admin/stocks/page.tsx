"use client";

import { useState, useCallback } from "react";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import type { UnifiedStockData } from "@/types/stock";
import StockSearch from "./_components/StockSearch";
import StockOverviewCard from "./_components/StockOverviewCard";
import CandlestickChart from "./_components/CandlestickChart";
import InvestmentMetrics from "./_components/InvestmentMetrics";
import CompanyProfile from "./_components/CompanyProfile";
import FinancialStatements from "./_components/FinancialStatements";
import NewsPanel from "./_components/NewsPanel";
import StockSkeleton from "./_components/StockSkeleton";

export default function AdminStocksPage() {
  const [symbol, setSymbol] = useState("");
  const [period, setPeriod] = useState("1y");
  const [stockData, setStockData] = useState<UnifiedStockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = useCallback(async (sym: string, per: string) => {
    if (!sym) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/stocks?symbol=${encodeURIComponent(sym)}&period=${per}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다");
      setStockData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (sym: string) => {
    setSymbol(sym);
    fetchStock(sym, period);
  };

  const handlePeriodChange = (per: string) => {
    setPeriod(per);
    if (symbol) fetchStock(symbol, per);
  };

  const handleRefresh = () => {
    if (symbol) fetchStock(symbol, period);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <TrendingUp size={18} className="text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-white">주식 정보</h1>
          </div>
          <p className="text-xs text-white/30 ml-11">
            Yahoo Finance + 한국투자증권 + Alpha Vantage 통합 조회
          </p>
        </div>
        {stockData && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            새로고침
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <StockSearch onSelect={handleSelect} currentSymbol={symbol} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 mb-6 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400/80">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <StockSkeleton />}

      {/* Stock Data */}
      {!loading && stockData && (
        <div className="space-y-6">
          {/* Overview */}
          <StockOverviewCard data={stockData} />

          {/* Chart */}
          <CandlestickChart
            data={stockData}
            onPeriodChange={handlePeriodChange}
            currentPeriod={period}
          />

          {/* Metrics + Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InvestmentMetrics data={stockData} />
            <CompanyProfile data={stockData} />
          </div>

          {/* Financial + News */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FinancialStatements data={stockData} />
            <NewsPanel data={stockData} />
          </div>

          {/* Data Source Footer */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/3 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/20">데이터 소스:</span>
              {stockData.sources.map((s) => (
                <span
                  key={s}
                  className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-400/60 border border-violet-500/10"
                >
                  {s}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-white/15">
              {new Date(stockData.fetchedAt).toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !stockData && !error && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <TrendingUp size={48} className="text-white/5 mb-4" />
          <p className="text-sm text-white/20 mb-1">종목을 검색해 주세요</p>
          <p className="text-xs text-white/10">
            검색창에서 종목명 또는 티커를 입력하면 종합 정보를 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}