"use client";

import { Trophy } from "lucide-react";

interface BestSellerItem {
  productId: string;
  name: string;
  image: string | null;
  price: number;
  totalQuantity: number;
  totalRevenue: number;
}

interface BestSellersProps {
  items: BestSellerItem[];
}

export default function BestSellers({ items }: BestSellersProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">베스트셀러 TOP 10</h3>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/30">판매 데이터가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
            >
              {/* Rank */}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
                  index < 3
                    ? "bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-violet-300"
                    : "bg-white/5 text-white/30"
                }`}
              >
                {index + 1}
              </span>

              {/* Image */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-9 w-9 rounded-lg object-cover bg-white/5 flex-shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg bg-white/5 flex-shrink-0" />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70 truncate">{item.name}</p>
                <p className="text-[10px] text-white/30">
                  {item.price.toLocaleString()}원
                </p>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-white/60 font-medium">
                  {item.totalQuantity}개
                </p>
                <p className="text-[10px] text-white/25">
                  {item.totalRevenue.toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
