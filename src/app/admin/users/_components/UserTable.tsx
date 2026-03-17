"use client";

import { Search, ChevronLeft, ChevronRight, Shield, User as UserIcon } from "lucide-react";

export interface UserRow {
  id: string;
  name: string;
  email: string | null;
  role: string;
  _count: {
    orders: number;
    reviews: number;
    posts: number;
  };
}

interface UserTableProps {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  roleCounts: { USER: number; ADMIN: number; ALL: number };
  currentRole: string | null;
  search: string;
  sort: string;
  onRoleFilter: (role: string | null) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onSelectUser: (userId: string) => void;
  loading: boolean;
}

const roleTabs = [
  { key: null, label: "전체" },
  { key: "USER", label: "일반회원" },
  { key: "ADMIN", label: "관리자" },
];

export default function UserTable({
  users,
  total,
  page,
  totalPages,
  roleCounts,
  currentRole,
  search,
  sort,
  onRoleFilter,
  onSearchChange,
  onSortChange,
  onPageChange,
  onSelectUser,
  loading,
}: UserTableProps) {
  return (
    <div className="space-y-4">
      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => {
          const count =
            tab.key === null
              ? roleCounts.ALL
              : roleCounts[tab.key as keyof typeof roleCounts] || 0;
          const isActive = currentRole === tab.key;
          return (
            <button
              key={tab.key ?? "all"}
              onClick={() => onRoleFilter(tab.key)}
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
            placeholder="사용자명, 이메일 검색"
            className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/60 focus:border-violet-500/50 focus:outline-none transition-colors"
        >
          <option value="latest">최신 가입순</option>
          <option value="oldest">오래된순</option>
          <option value="name_asc">이름 오름차순</option>
          <option value="name_desc">이름 내림차순</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_80px_80px_80px_80px] gap-2 px-4 py-3 border-b border-white/5 text-[11px] text-white/30 font-medium">
          <span>사용자명</span>
          <span>이메일</span>
          <span>역할</span>
          <span>주문</span>
          <span>리뷰</span>
          <span>게시글</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {search ? "검색 결과가 없습니다." : "회원이 없습니다."}
          </div>
        ) : (
          <div>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="w-full grid grid-cols-1 md:grid-cols-[2fr_2fr_80px_80px_80px_80px] gap-1 md:gap-2 px-4 py-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${
                      user.role === "ADMIN"
                        ? "bg-violet-500/20 text-violet-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white/70 truncate">{user.name}</span>
                </div>
                <span className="text-xs text-white/40 truncate">
                  {user.email || "-"}
                </span>
                <span>
                  {user.role === "ADMIN" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                      <Shield size={9} />
                      관리자
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/40">
                      <UserIcon size={9} />
                      회원
                    </span>
                  )}
                </span>
                <span className="text-xs text-white/40">{user._count.orders}</span>
                <span className="text-xs text-white/40">{user._count.reviews}</span>
                <span className="text-xs text-white/40">{user._count.posts}</span>
              </button>
            ))}
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
          <span className="text-[10px] text-white/20 ml-2">총 {total}명</span>
        </div>
      )}
    </div>
  );
}
