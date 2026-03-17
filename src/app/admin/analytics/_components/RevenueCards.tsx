"use client";

import { TrendingUp, Calendar, CalendarDays, DollarSign } from "lucide-react";

interface RevenueCardsProps {
  today: number;
  week: number;
  month: number;
  total: number;
}

const cards = [
  { key: "today", label: "오늘 매출", icon: TrendingUp, color: "violet" },
  { key: "week", label: "이번주 매출", icon: Calendar, color: "emerald" },
  { key: "month", label: "이번달 매출", icon: CalendarDays, color: "blue" },
  { key: "total", label: "전체 매출", icon: DollarSign, color: "rose" },
] as const;

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  violet: { bg: "bg-violet-500/10", icon: "text-violet-400", border: "border-violet-500/20" },
  emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", border: "border-emerald-500/20" },
  blue: { bg: "bg-blue-500/10", icon: "text-blue-400", border: "border-blue-500/20" },
  rose: { bg: "bg-rose-500/10", icon: "text-rose-400", border: "border-rose-500/20" },
};

export default function RevenueCards({ today, week, month, total }: RevenueCardsProps) {
  const values: Record<string, number> = { today, week, month, total };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const c = colorMap[card.color];
        const value = values[card.key];
        return (
          <div
            key={card.key}
            className={`rounded-2xl border ${c.border} bg-white/[0.03] backdrop-blur-xl p-5`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
              <card.icon size={20} className={c.icon} />
            </div>
            <p className="text-xs text-white/40">{card.label}</p>
            <p className="mt-1 text-xl font-bold text-white">
              {value.toLocaleString()}
              <span className="text-sm font-normal text-white/30 ml-0.5">원</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
