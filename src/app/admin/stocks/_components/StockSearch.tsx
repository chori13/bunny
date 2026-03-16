"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import type { StockSearchResult } from "@/types/stock";

interface StockSearchProps {
  onSelect: (symbol: string) => void;
  currentSymbol: string;
}

const popularStocks = [
  { symbol: "005930", name: "삼성전자", exchange: "KRX" },
  { symbol: "000660", name: "SK하이닉스", exchange: "KRX" },
  { symbol: "AAPL", name: "Apple", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon", exchange: "NASDAQ" },
];

export default function StockSearch({ onSelect, currentSymbol }: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/stocks/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          ref={inputRef}
          type="text"
          placeholder="종목명 또는 티커를 검색하세요 (예: 삼성전자, AAPL)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-11 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/25 focus:border-violet-500/50 focus:outline-none transition-colors"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400 animate-spin" />
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Current Symbol Badge */}
      {currentSymbol && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white/30">현재:</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-mono text-violet-400">
            {currentSymbol}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-full rounded-xl bg-[#1a1a2e] border border-white/10 shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div>
              <p className="px-4 py-2 text-[10px] text-white/25 font-semibold uppercase tracking-wider">검색 결과</p>
              {results.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => handleSelect(r.symbol)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-mono font-bold text-violet-400 min-w-[70px]">{r.symbol}</span>
                  <span className="text-xs text-white/60 flex-1 truncate">{r.name}</span>
                  <span className="text-[10px] text-white/20">{r.exchange}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query && !loading && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-white/25">검색 결과가 없습니다</p>
              <p className="text-[10px] text-white/15 mt-1">한국 주식은 6자리 코드로 검색하세요 (예: 005930)</p>
            </div>
          )}

          {/* Popular Stocks */}
          {!query && (
            <div>
              <p className="px-4 py-2 text-[10px] text-white/25 font-semibold uppercase tracking-wider">인기 종목</p>
              {popularStocks.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => handleSelect(s.symbol)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-mono font-bold text-violet-400 min-w-[70px]">{s.symbol}</span>
                  <span className="text-xs text-white/60 flex-1">{s.name}</span>
                  <span className="text-[10px] text-white/20">{s.exchange}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}