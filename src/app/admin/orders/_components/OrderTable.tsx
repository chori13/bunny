"use client";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge, { statusMap } from "./StatusBadge";

interface OrderItem {
  product: { name: string; image: string | null };
  quantity: number;
  price: number;
}

export interface OrderRow {
  id: string;
  totalAmount: number;
  status: string;
  recipientName: string;
  createdAt: string;
  user: { name: string };
  items: OrderItem[];
}

interface OrderTableProps {
  orders: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  currentStatus: string | null;
  search: string;
  sort: string;
  onStatusFilter: (status: string | null) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onSelectOrder: (orderId: string) => void;
  loading: boolean;
}

const statusTabs = [
  { key: null, label: "전체" },
  { key: "PENDING", label: "대기" },
  { key: "PAID", label: "결제완료" },
  { key: "SHIPPING", label: "배송중" },
  { key: "DELIVERED", label: "배송완료" },
  { key: "CANCELLED", label: "취소" },
];

export default function OrderTable({
  orders,
  total,
  page,
  totalPages,
  statusCounts,
  currentStatus,
  search,
  sort,
  onStatusFilter,
  onSearchChange,
  onSortChange,
  onPageChange,
  onSelectOrder,
  loading,
}: OrderTableProps) {
  const allCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = tab.key === null ? allCount : (statusCounts[tab.key] || 0);
          const isActive = currentStatus === tab.key;
          return (
            <button
              key={tab.key ?? "all"}
              onClick={() => onStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${isActive ? "text-violet-300" : "text-white/25"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="주문번호, 수령인, 사용자명 검색"
            className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 focus:border-violet-500/50 focus:outline-none transition-colors"
        >
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="amount_high">금액 높은순</option>
          <option value="amount_low">금액 낮은순</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_100px_100px] gap-2 px-4 py-3 border-b border-white/5 text-[11px] text-white/30 font-medium">
          <span>주문번호</span>
          <span>상품</span>
          <span>주문자</span>
          <span>수령인</span>
          <span>금액</span>
          <span>상태</span>
          <span>일시</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {search ? "검색 결과가 없습니다." : "주문이 없습니다."}
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const productName =
                order.items.length > 0
                  ? order.items[0].product.name +
                    (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : "")
                  : "-";

              return (
                <button
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_100px_100px] gap-1 md:gap-2 px-4 py-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <span className="text-xs text-white/30 font-mono truncate">
                    {order.id.slice(0, 10)}...
                  </span>
                  <span className="text-xs text-white/70 truncate">{productName}</span>
                  <span className="text-xs text-white/40">{order.user.name}</span>
                  <span className="text-xs text-white/40">{order.recipientName}</span>
                  <span className="text-xs text-white/70 font-medium">
                    {order.totalAmount.toLocaleString()}원
                  </span>
                  <span>
                    <StatusBadge status={order.status} />
                  </span>
                  <span className="text-xs text-white/25">
                    {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} className="text-white/50" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let p: number;
            if (totalPages <= 5) {
              p = i + 1;
            } else if (page <= 3) {
              p = i + 1;
            } else if (page >= totalPages - 2) {
              p = totalPages - 4 + i;
            } else {
              p = page - 2 + i;
            }
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={14} className="text-white/50" />
          </button>
          <span className="text-[10px] text-white/20 ml-2">총 {total}건</span>
        </div>
      )}
    </div>
  );
}
