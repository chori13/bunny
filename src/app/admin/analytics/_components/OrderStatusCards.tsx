"use client";

import { Clock, CreditCard, Truck, PackageCheck, Ban, ShoppingBag } from "lucide-react";

interface OrderStatusCardsProps {
  statusCounts: Record<string, number>;
  todayOrders: number;
}

const statuses = [
  { key: "PENDING", label: "대기", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { key: "PAID", label: "결제완료", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "SHIPPING", label: "배송중", icon: Truck, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "DELIVERED", label: "배송완료", icon: PackageCheck, color: "text-white/50", bg: "bg-white/5" },
  { key: "CANCELLED", label: "취소", icon: Ban, color: "text-red-400", bg: "bg-red-500/10" },
];

export default function OrderStatusCards({ statusCounts, todayOrders }: OrderStatusCardsProps) {
  const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">주문 현황</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">오늘</span>
          <span className="text-sm font-bold text-violet-400">{todayOrders}건</span>
        </div>
      </div>

      {/* Status bars */}
      <div className="space-y-3">
        {statuses.map((s) => {
          const count = statusCounts[s.key] || 0;
          const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={13} className={s.color} />
              </div>
              <span className="text-xs text-white/40 w-14 flex-shrink-0">{s.label}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600/60 to-violet-400/40 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-white/60 font-medium w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30">전체 주문</span>
        <span className="text-sm font-bold text-white">{totalOrders}건</span>
      </div>
    </div>
  );
}
