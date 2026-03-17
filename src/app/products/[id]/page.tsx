"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface Product {
  id: string;
  name: string;
  image: string | null;
  price: number;
  remarks: string | null;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { name: string };
}

interface ReviewData {
  reviews: Review[];
  avgRating: number;
  totalCount: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [wished, setWished] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";
  const addItem = useCartStore((s) => s.addItem);

  // 리뷰 상태
  const [reviewData, setReviewData] = useState<ReviewData>({ reviews: [], avgRating: 0, totalCount: 0 });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // 찜 여부 확인
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/wishlist?productId=${id}`)
      .then((res) => res.json())
      .then((data) => setWished(data.wished))
      .catch(() => {});
  }, [id, session?.user?.id]);

  // 리뷰 목록 조회
  useEffect(() => {
    fetch(`/api/products/${id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviewData(data);
      })
      .catch(() => {});
  }, [id]);

  const handleWishToggle = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setWishLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setWished(data.wished);
    }
    setWishLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1500);
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert("상품이 삭제되었습니다.");
    router.push("/products");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    if (reviewRating === 0) {
      setReviewMessage({ type: "error", text: "평점을 선택해주세요." });
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage(null);

    const res = await fetch(`/api/products/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, content: reviewContent }),
    });

    const data = await res.json();
    if (res.ok) {
      setReviewData((prev) => ({
        reviews: [data, ...prev.reviews],
        totalCount: prev.totalCount + 1,
        avgRating:
          Math.round(
            ((prev.avgRating * prev.totalCount + data.rating) / (prev.totalCount + 1)) * 10
          ) / 10,
      }));
      setReviewRating(0);
      setReviewContent("");
      setReviewMessage({ type: "success", text: "리뷰가 등록되었습니다." });
    } else {
      setReviewMessage({ type: "error", text: data.error });
    }
    setReviewSubmitting(false);
  };

  // 이미 리뷰를 작성했는지 확인
  const hasReviewed = reviewData.reviews.some(
    (r) => r.user.name === session?.user?.name
  );

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[85vh] flex-col items-center justify-center gap-4">
        <p className="text-white/40">상품을 찾을 수 없습니다.</p>
        <Link href="/products" className="text-sm text-violet-400 hover:text-violet-300">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const createdDate = new Date(product.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white"
      >
        &larr; 상품 목록
      </Link>

      <div className="glass overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 이미지 영역 */}
          <div className="relative h-80 bg-white/[0.02] md:h-full md:min-h-[480px]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-6xl text-white/10">No Image</span>
              </div>
            )}
            {/* 찜하기 버튼 (이미지 위) */}
            <button
              onClick={handleWishToggle}
              disabled={wishLoading}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition hover:bg-black/60"
            >
              <Heart
                size={20}
                className={wished ? "fill-red-500 text-red-500" : "text-white/70"}
              />
            </button>
          </div>

          {/* 상세 정보 */}
          <div className="flex flex-col justify-between p-8">
            <div className="space-y-6">
              {/* 상품명 */}
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">{product.name}</h1>
                <p className="mt-1 text-sm text-white/30">등록일 {createdDate}</p>
              </div>

              {/* 가격 */}
              <div className="border-t border-white/5 pt-6">
                <p className="text-sm text-white/40">판매가</p>
                <p className="mt-1 text-3xl font-bold text-violet-400">
                  {product.price.toLocaleString()}
                  <span className="text-lg font-medium">원</span>
                </p>
              </div>

              {/* 평균 평점 */}
              {reviewData.totalCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= Math.round(reviewData.avgRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/15"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-white/60">
                    {reviewData.avgRating}
                  </span>
                  <span className="text-xs text-white/30">
                    ({reviewData.totalCount}개 리뷰)
                  </span>
                </div>
              )}

              {/* 비고 */}
              <div className="border-t border-white/5 pt-6">
                <p className="text-sm text-white/40">상품 설명</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {product.remarks || "등록된 상품 설명이 없습니다."}
                </p>
              </div>

              {/* 추가 정보 */}
              <div className="border-t border-white/5 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-lg">🚚</p>
                    <p className="mt-1 text-xs text-white/40">무료 배송</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-lg">🔄</p>
                    <p className="mt-1 text-xs text-white/40">7일 이내 환불</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-lg">🏅</p>
                    <p className="mt-1 text-xs text-white/40">정품 보장</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-4 text-center">
                    <p className="text-lg">📦</p>
                    <p className="mt-1 text-xs text-white/40">빠른 출고</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="mt-8 space-y-3">
              {isAdmin ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/products/${product.id}/edit`)}
                    className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 rounded-xl border border-red-500/20 py-3 text-sm font-medium text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/20 py-3.5 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/10"
                  >
                    <ShoppingCart size={18} />
                    {cartAdded ? "장바구니에 담았습니다!" : "장바구니 담기"}
                  </button>
                  <button className="btn-gradient w-full rounded-xl py-3.5 text-sm font-semibold text-white">
                    구매하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 섹션 */}
      <section className="mt-10">
        <h2 className="mb-6 text-xl font-bold text-white">
          리뷰 {reviewData.totalCount > 0 && <span className="text-violet-400">{reviewData.totalCount}</span>}
        </h2>

        {/* 리뷰 작성 폼 */}
        {session && !hasReviewed && !isAdmin && (
          <form onSubmit={handleReviewSubmit} className="glass mb-6 rounded-2xl p-6">
            <p className="mb-3 text-sm font-medium text-white/60">리뷰 작성</p>

            {/* 별점 선택 */}
            <div className="mb-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHover(star)}
                  onMouseLeave={() => setReviewHover(0)}
                  className="p-0.5 transition"
                >
                  <Star
                    size={24}
                    className={
                      star <= (reviewHover || reviewRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-white/20"
                    }
                  />
                </button>
              ))}
              {reviewRating > 0 && (
                <span className="ml-2 text-sm text-white/40">{reviewRating}점</span>
              )}
            </div>

            {/* 리뷰 내용 */}
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 남겨주세요 (선택)"
              rows={3}
              className="input-dark mb-4 w-full rounded-xl px-4 py-3 text-sm"
            />

            {/* 메시지 */}
            {reviewMessage && (
              <div
                className={`mb-4 rounded-xl px-4 py-3 text-sm ${
                  reviewMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {reviewMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={reviewSubmitting || reviewRating === 0}
              className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {reviewSubmitting ? "등록 중..." : "리뷰 등록"}
            </button>
          </form>
        )}

        {/* 비로그인 안내 */}
        {!session && (
          <div className="glass mb-6 rounded-2xl p-5 text-center">
            <Link href="/login" className="text-sm text-violet-400 hover:underline">
              로그인하고 리뷰를 남겨보세요
            </Link>
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviewData.reviews.length > 0 ? (
          <div className="space-y-3">
            {reviewData.reviews.map((review) => (
              <div key={review.id} className="glass rounded-2xl p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-white/15"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-white/60">{review.user.name}</span>
                  </div>
                  <span className="text-xs text-white/30">
                    {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {review.content && (
                  <p className="text-sm leading-relaxed text-white/50">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 text-center">
            <p className="text-sm text-white/30">아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
          </div>
        )}
      </section>
    </div>
  );
}
