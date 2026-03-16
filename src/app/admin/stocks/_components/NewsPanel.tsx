"use client";

import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { UnifiedStockData } from "@/types/stock";

export default function NewsPanel({ data }: { data: UnifiedStockData }) {
  if (data.news.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
        <h3 className="text-xs font-semibold text-white/60 mb-3">뉴스</h3>
        <p className="text-xs text-white/20 text-center py-6">
          뉴스 데이터가 없습니다 (Alpha Vantage API 키가 필요합니다)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold text-white/60 mb-3">
        뉴스 <span className="text-white/20">({data.news.length})</span>
      </h3>
      <div className="space-y-2">
        {data.news.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
          >
            {/* Sentiment */}
            {item.sentiment !== undefined && (
              <div className="flex-shrink-0 mt-0.5">
                {item.sentiment > 0.15 ? (
                  <TrendingUp size={14} className="text-emerald-400/60" />
                ) : item.sentiment < -0.15 ? (
                  <TrendingDown size={14} className="text-red-400/60" />
                ) : (
                  <Minus size={14} className="text-white/20" />
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors line-clamp-2 leading-relaxed">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/20">{item.source}</span>
                {item.publishedAt && (
                  <>
                    <span className="text-[10px] text-white/10">·</span>
                    <span className="text-[10px] text-white/15">
                      {formatDate(item.publishedAt)}
                    </span>
                  </>
                )}
                {item.sentiment !== undefined && (
                  <>
                    <span className="text-[10px] text-white/10">·</span>
                    <SentimentBadge score={item.sentiment} />
                  </>
                )}
              </div>
            </div>

            <ExternalLink size={12} className="text-white/10 group-hover:text-white/30 flex-shrink-0 mt-1" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SentimentBadge({ score }: { score: number }) {
  const label =
    score > 0.25 ? "매우 긍정" :
    score > 0.1 ? "긍정" :
    score > -0.1 ? "중립" :
    score > -0.25 ? "부정" : "매우 부정";

  const color =
    score > 0.25 ? "text-emerald-400 bg-emerald-500/10" :
    score > 0.1 ? "text-emerald-400/70 bg-emerald-500/5" :
    score > -0.1 ? "text-white/30 bg-white/5" :
    score > -0.25 ? "text-red-400/70 bg-red-500/5" : "text-red-400 bg-red-500/10";

  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium ${color}`}>
      {label}
    </span>
  );
}

function formatDate(dateStr: string) {
  // Alpha Vantage format: "20260315T120000"
  if (dateStr.includes("T") && !dateStr.includes("-")) {
    const y = dateStr.slice(0, 4);
    const m = dateStr.slice(4, 6);
    const d = dateStr.slice(6, 8);
    return `${y}.${m}.${d}`;
  }
  try {
    return new Date(dateStr).toLocaleDateString("ko-KR");
  } catch {
    return dateStr;
  }
}