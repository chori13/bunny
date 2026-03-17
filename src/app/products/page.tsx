"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  image: string | null;
  price: number;
  remarks: string | null;
  createdAt: string;
}

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "hay", label: "건초" },
  { value: "food", label: "사료" },
  { value: "snack", label: "간식" },
  { value: "supplement", label: "영양제" },
  { value: "supply", label: "용품" },
];

function getCategory(product: Product): string {
  const text = `${product.name} ${product.remarks || ""}`.toLowerCase();
  if (text.includes("건초") || text.includes("티모시") || text.includes("알팔파") || text.includes("오차드")) return "hay";
  if (text.includes("사료") || text.includes("펠릿")) return "food";
  if (text.includes("간식") || text.includes("스틱") || text.includes("동결건조") || text.includes("당근") || text.includes("사과")) return "snack";
  if (text.includes("비타민") || text.includes("유산균") || text.includes("영양") || text.includes("파파야") || text.includes("헤어볼") || text.includes("모구증")) return "supplement";
  return "supply";
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState("all");
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === "ADMIN";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (sort !== "latest") params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSort("latest");
    setMinPrice("");
    setMaxPrice("");
    setCategory("all");
  };

  const hasActiveFilters = search || sort !== "latest" || minPrice || maxPrice || category !== "all";

  const filteredProducts = category === "all"
    ? products
    : products.filter((p) => getCategory(p) === category);

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert("상품이 삭제되었습니다.");
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">전체 상품</h1>
          <p className="mt-2 text-sm text-white/40">관리자가 등록한 상품 목록</p>
        </div>
        {isAdmin && (
          <Link
            href="/products/register"
            className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            + 상품 등록
          </Link>
        )}
      </div>

      {/* 검색 & 필터 */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          {/* 검색바 */}
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="상품명 또는 설명으로 검색"
                className="input-dark w-full rounded-xl py-3 pl-11 pr-4 text-sm"
              />
            </div>
          </form>

          {/* 필터 토글 */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              showFilter || (minPrice || maxPrice)
                ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={16} />
            필터
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === cat.value
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "border border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 필터 패널 */}
        {showFilter && (
          <div className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-end gap-4">
              {/* 정렬 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/40">정렬</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="input-dark rounded-xl px-4 py-2.5 text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 최소 가격 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/40">최소 가격</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="input-dark w-32 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* 최대 가격 */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/40">최대 가격</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="무제한"
                  className="input-dark w-32 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* 필터 초기화 */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={14} />
                  초기화
                </button>
              )}
            </div>
          </div>
        )}

        {/* 검색 결과 수 */}
        {!loading && (
          <p className="text-xs text-white/30">
            {hasActiveFilters ? `검색 결과 ${filteredProducts.length}개` : `총 ${filteredProducts.length}개 상품`}
          </p>
        )}
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-white/40">
            {hasActiveFilters ? "검색 결과가 없습니다." : "등록된 상품이 없습니다."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="glass group cursor-pointer overflow-hidden rounded-2xl transition hover:border-violet-500/30"
            >
              <div className="relative h-48 bg-white/[0.02]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl text-white/10">No Image</span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-base font-semibold text-white truncate">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-violet-400">
                  {product.price.toLocaleString()}원
                </p>
                {product.remarks && (
                  <p className="text-sm text-white/40 line-clamp-2">{product.remarks}</p>
                )}

                {isAdmin ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${product.id}/edit`);
                      }}
                      className="flex-1 rounded-xl border border-white/10 py-2 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, product.id, product.name)}
                      className="flex-1 rounded-xl border border-red-500/20 py-2 text-sm font-medium text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="btn-gradient w-full rounded-xl py-2.5 text-sm font-semibold text-white"
                  >
                    구매하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
