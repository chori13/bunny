"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "bg-yellow-500/15 text-yellow-400" },
  PAID: { label: "결제완료", color: "bg-emerald-500/15 text-emerald-400" },
  SHIPPING: { label: "배송중", color: "bg-blue-500/15 text-blue-400" },
  DELIVERED: { label: "배송완료", color: "bg-white/10 text-white/50" },
  CANCELLED: { label: "취소", color: "bg-red-500/15 text-red-400" },
};

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string };
  items: { product: { name: string } }[];
}

interface RecentOrdersFeedProps {
  orders: RecentOrder[];
}

export default function RecentOrdersFeed({ orders }: RecentOrdersFeedProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">최근 주문</h3>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-white/30">주문이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const st = statusMap[order.status] || statusMap.PENDING;
            const productName =
              order.items.length > 0
                ? order.items[0].product.name +
                  (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : "")
                : "-";

            const timeAgo = getTimeAgo(new Date(order.createdAt));

            return (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/70 truncate">{productName}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-white/25">
                    <span>{order.user.name}</span>
                    <span>·</span>
                    <span>{timeAgo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <span className="text-xs font-medium text-white/60">
                    {order.totalAmount.toLocaleString()}원
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color}`}
                  >
                    {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}일 전`;
}
