"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  Package,
  ShoppingBag,
  MessageSquare,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

interface Stats {
  userCount: number;
  productCount: number;
  orderCount: number;
  postCount: number;
  eventCount: number;
  totalRevenue: number;
  recentOrders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string };
    items: { product: { name: string }; quantity: number }[];
  }[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "bg-yellow-500/15 text-yellow-400" },
  PAID: { label: "결제완료", color: "bg-emerald-500/15 text-emerald-400" },
  SHIPPING: { label: "배송중", color: "bg-blue-500/15 text-blue-400" },
  DELIVERED: { label: "배송완료", color: "bg-white/10 text-white/50" },
  CANCELLED: { label: "취소", color: "bg-red-500/15 text-red-400" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    { label: "회원 수", value: stats.userCount, icon: Users, color: "violet" },
    { label: "상품 수", value: stats.productCount, icon: Package, color: "emerald" },
    { label: "주문 수", value: stats.orderCount, icon: ShoppingBag, color: "blue" },
    { label: "게시글", value: stats.postCount, icon: MessageSquare, color: "cyan" },
    { label: "이벤트", value: stats.eventCount, icon: CalendarDays, color: "amber" },
    {
      label: "총 매출",
      value: `${stats.totalRevenue.toLocaleString()}원`,
      icon: TrendingUp,
      color: "rose",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string }> = {
    violet: { bg: "bg-violet-500/10", icon: "text-violet-400" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-400" },
    cyan: { bg: "bg-cyan-500/10", icon: "text-cyan-400" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400" },
    rose: { bg: "bg-rose-500/10", icon: "text-rose-400" },
  };

  return (
    <div className="px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="mt-1 text-sm text-white/40">
          안녕하세요, {session?.user?.name}님
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const c = colorMap[card.color];
          return (
            <div key={card.label} className="glass rounded-2xl p-5">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                <card.icon size={20} className={c.icon} />
              </div>
              <p className="text-xs text-white/40">{card.label}</p>
              <p className="mt-1 text-xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* 최근 주문 */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/60">최근 주문</h2>
          <div className="flex items-center gap-3">
            <Link href="/admin/analytics" className="text-xs text-emerald-400 hover:underline">
              매출 분석
            </Link>
            <Link href="/admin/orders" className="text-xs text-violet-400 hover:underline">
              전체 보기
            </Link>
          </div>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/30">주문이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order) => {
              const st = statusMap[order.status] || statusMap.PENDING;
              const productName =
                order.items.length > 0
                  ? order.items[0].product.name +
                    (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : "")
                  : "-";

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{productName}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/30">
                      <span>{order.user.name}</span>
                      <span>·</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white/70">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}