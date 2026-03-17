"use client";

import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface ReviewRow {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: string; name: string };
  product: { id: string; name: string; image: string | null };
}

interface ReviewTableProps {
  reviews: ReviewRow[];
  total: number;
  page: number;
  totalPages: number;
  ratingCounts: Record<number, number>;
  totalReviews: number;
  avgRating: number;
  currentRating: string | null;
  search: string;
  sort: string;
  onRatingFilter: (rating: string | null) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onSelectReview: (reviewId: string) => void;
  loading: boolean;
}

export default function ReviewTable({
  reviews,
  total,
  page,
  totalPages,
  ratingCounts,
  totalReviews,
  avgRating,
  currentRating,
  search,
  sort,
  onRatingFilter,
  onSearchChange,
  onSortChange,
  onPageChange,
  onSelectReview,
  loading,
}: ReviewTableProps) {
  const ratingTabs = [
    { key: null, label: "전체", count: totalReviews },
    ...[5, 4, 3, 2, 1].map((r) => ({
      key: String(r),
      label: `${r}점`,
      count: ratingCounts[r] || 0,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{avgRating}</span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-white/10"}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-white/30">총 {totalReviews}개 리뷰</span>
      </div>

      {/* Rating Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {ratingTabs.map((tab) => {
          const isActive = currentRating === tab.key;
          return (
            <button
              key={tab.key ?? "all"}
              onClick={() => onRatingFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {tab.key && <Star size={10} className={isActive ? "text-amber-400 fill-amber-400" : "text-amber-400/40"} />}
              {tab.label}
              <span className={`text-[10px] ${isActive ? "text-violet-300" : "text-white/25"}`}>
                {tab.count}
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
            placeholder="리뷰 내용, 작성자, 상품명 검색"
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
          <option value="rating_high">평점 높은순</option>
          <option value="rating_low">평점 낮은순</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_3fr_1fr_100px] gap-2 px-4 py-3 border-b border-white/5 text-[11px] text-white/30 font-medium">
          <span>상품</span>
          <span>리뷰 내용</span>
          <span>작성자</span>
          <span>일시</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-sm text-white/30">
            {search ? "검색 결과가 없습니다." : "리뷰가 없습니다."}
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <button
                key={review.id}
                onClick={() => onSelectReview(review.id)}
                className="w-full grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr_100px] gap-1 md:gap-2 px-4 py-3 text-left border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {/* Product */}
                <div className="flex items-center gap-2">
                  {review.product.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="h-8 w-8 rounded-lg object-cover bg-white/5 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex-shrink-0" />
                  )}
                  <span className="text-xs text-white/70 truncate">{review.product.name}</span>
                </div>

                {/* Content + Rating */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={9}
                        className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/10"}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    {review.content || "(내용 없음)"}
                  </p>
                </div>

                {/* User */}
                <span className="text-xs text-white/40">{review.user.name}</span>

                {/* Date */}
                <span className="text-xs text-white/25">
                  {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
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
          <span className="text-[10px] text-white/20 ml-2">총 {total}개</span>
        </div>
      )}
    </div>
  );
}
