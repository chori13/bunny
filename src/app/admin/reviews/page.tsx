"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ReviewTable, { type ReviewRow } from "./_components/ReviewTable";
import ReviewDetail from "./_components/ReviewDetail";

interface ReviewsResponse {
  reviews: ReviewRow[];
  total: number;
  page: number;
  totalPages: number;
  ratingCounts: Record<number, number>;
  totalReviews: number;
  avgRating: number;
}

interface ReviewDetailData {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string | null };
  product: { id: string; name: string; image: string | null; price: number };
}

export default function AdminReviewsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<ReviewDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (ratingFilter) params.set("rating", ratingFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("sort", sort);

      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("리뷰 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [ratingFilter, search, sort, page]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchReviews();
    }
  }, [fetchReviews, authStatus, session]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch review detail
  const handleSelectReview = async (reviewId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`);
      if (res.ok) {
        setSelectedReview(await res.json());
      }
    } catch (error) {
      console.error("리뷰 상세 로드 실패:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Delete review
  const handleDelete = async (reviewId: string) => {
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSelectedReview(null);
      fetchReviews();
    }
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && !data && loading)) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
          <Star size={12} />
          Review Management
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">리뷰 관리</h1>
        <p className="text-white/40 text-sm">
          전체 리뷰를 확인하고 부적절한 리뷰를 관리할 수 있습니다
        </p>
      </div>

      {/* Review Table */}
      <ReviewTable
        reviews={data?.reviews || []}
        total={data?.total || 0}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        ratingCounts={data?.ratingCounts || {}}
        totalReviews={data?.totalReviews || 0}
        avgRating={data?.avgRating || 0}
        currentRating={ratingFilter}
        search={searchInput}
        sort={sort}
        onRatingFilter={(r) => {
          setRatingFilter(r);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        onPageChange={setPage}
        onSelectReview={handleSelectReview}
        loading={loading}
      />

      {/* Detail loading */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && !detailLoading && (
        <ReviewDetail
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
