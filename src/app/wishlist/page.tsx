"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    remarks: string | null;
  };
}

export default function WishlistPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch("/api/wishlist/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, authStatus, router]);

  const handleRemove = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleAddToCart = (product: WishlistItem["product"]) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold gradient-text">찜한 상품</h1>
        <p className="mt-2 text-sm text-white/40">내가 찜한 상품 목록</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.03]">
            <Heart size={36} className="text-white/15" />
          </div>
          <div className="text-center">
            <p className="text-white/40">찜한 상품이 없습니다</p>
            <p className="mt-1 text-sm text-white/20">마음에 드는 상품을 찜해보세요!</p>
          </div>
          <Link
            href="/products"
            className="btn-gradient rounded-xl px-8 py-3 text-sm font-semibold text-white"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass group overflow-hidden rounded-2xl transition hover:border-violet-500/30"
            >
              <Link href={`/products/${item.product.id}`}>
                <div className="relative h-44 bg-white/[0.02]">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl text-white/10">No Image</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-5 space-y-3">
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="text-base font-semibold text-white truncate hover:text-violet-400 transition">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-lg font-bold text-violet-400">
                  {item.product.price.toLocaleString()}원
                </p>
                {item.product.remarks && (
                  <p className="text-sm text-white/40 line-clamp-1">{item.product.remarks}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="btn-gradient flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white"
                  >
                    <ShoppingCart size={14} />
                    장바구니
                  </button>
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="flex items-center justify-center rounded-xl border border-red-500/20 px-3 py-2.5 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
