"use client";

import { Search, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export interface AuditLogRow {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  adminId: string;
  adminName: string;
  createdAt: string;
}

interface AuditLogTableProps {
  logs: AuditLogRow[];
  total: number;
  page: number;
  totalPages: number;
  actionCounts: Record<string, number>;
  currentAction: string | null;
  currentTargetType: string | null;
  search: string;
  onActionFilter: (action: string | null) => void;
  onTargetTypeFilter: (type: string | null) => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  ORDER_STATUS_CHANGE: { label: "주문 상태 변경", color: "bg-blue-500/15 text-blue-400" },
  USER_ROLE_CHANGE: { label: "역할 변경", color: "bg-violet-500/15 text-violet-400" },
  REVIEW_DELETE: { label: "리뷰 삭제", color: "bg-red-500/15 text-red-400" },
  PRODUCT_CREATE: { label: "상품 등록", color: "bg-emerald-500/15 text-emerald-400" },
  PRODUCT_UPDATE: { label: "상품 수정", color: "bg-amber-500/15 text-amber-400" },
  PRODUCT_DELETE: { label: "상품 삭제", color: "bg-red-500/15 text-red-400" },
  EVENT_CREATE: { label: "이벤트 생성", color: "bg-emerald-500/15 text-emerald-400" },
  EVENT_UPDATE: { label: "이벤트 수정", color: "bg-amber-500/15 text-amber-400" },
  NOTICE_CREATE: { label: "공지 생성", color: "bg-emerald-500/15 text-emerald-400" },
  NOTICE_UPDATE: { label: "공지 수정", color: "bg-amber-500/15 text-amber-400" },
};

const targetTypeLabels: Record<string, string> = {
  Order: "주문",
  User: "회원",
  Review: "리뷰",
  Product: "상품",
  Event: "이벤트",
  Notice: "공지사항",
};

const targetTypeTabs = [
  { key: null, label: "전체" },
  { key: "Order", label: "주문" },
  { key: "User", label: "회원" },
  { key: "Review", label: "리뷰" },
  { key: "Product", label: "상품" },
  { key: "Event", label: "이벤트" },
  { key: "Notice", label: "공지" },
];

function formatDetail(action: string, detail: string | null): string {
  if (!detail) return "-";
  try {
    const d = JSON.parse(detail);
    if (action === "ORDER_STATUS_CHANGE") {
      return `${d.from} → ${d.to}`;
    }
    if (action === "USER_ROLE_CHANGE") {
      return `${d.name}: ${d.from} → ${d.to}`;
    }
    if (action === "REVIEW_DELETE") {
      return `평점 ${d.rating}점`;
    }
    return Object.entries(d)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return detail.slice(0, 50);
  }
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
  if (diffDay < 7) return `${diffDay}일 전`;
  return new Date(date).toLocaleDateString("ko-KR");
}

export default function AuditLogTable({
  logs,
  total,
  page,
  totalPages,
  actionCounts,
  currentAction,
  currentTargetType,
  search,
  onActionFilter,
  onTargetTypeFilter,
  onSearchChange,
  onPageChange,
  loading,
}: AuditLogTableProps) {
  const allCount = Object.values(actionCounts).reduce((a, b) => a + b, 0);

  // Action filter from available actions
  const availableActions = Object.keys(actionCounts);

  return (
    <div className="space-y-4">
      {/* Target Type Filter */}
      <div className="flex flex-wrap gap-2">
        {targetTypeTabs.map((tab) => {
          const isActive = currentTargetType === tab.key;
          return (
            <button
              key={tab.key ?? "all"}
              onClick={() => onTargetTypeFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Action Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={currentAction || ""}
          onChange={(e) => onActionFilter(e.target.value || null)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 focus:border-violet-500/50 focus:outline-none transition-colors"
        >
          <option value="">전체 액션 ({allCount})</option>
          {availableActions.map((a) => (
            <option key={a} value={a}>
              {actionLabels[a]?.label || a} ({actionCounts[a]})
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="관리자명, 대상 ID, 상세 내용 검색"
            className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Log List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {search ? "검색 결과가 없습니다." : "감사 로그가 없습니다."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const actionInfo = actionLabels[log.action] || {
                label: log.action,
                color: "bg-white/10 text-white/40",
              };
              return (
                <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className="h-2 w-2 rounded-full bg-violet-500/50" />
                    <div className="w-px flex-1 bg-white/5 mt-1" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${actionInfo.color}`}
                      >
                        {actionInfo.label}
                      </span>
                      <span className="text-[10px] text-white/20 rounded bg-white/5 px-1.5 py-0.5">
                        {targetTypeLabels[log.targetType] || log.targetType}
                      </span>
                      <span className="text-[10px] text-white/15 font-mono">
                        #{log.targetId.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {formatDetail(log.action, log.detail)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-white/25">
                        {log.adminName}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-white/15">
                        <Clock size={9} />
                        {getTimeAgo(new Date(log.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>
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
            if (totalPages <= 5) p = i + 1;
            else if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
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
