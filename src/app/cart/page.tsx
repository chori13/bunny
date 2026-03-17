"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-6xl">🛒</p>
        <h1 className="text-xl font-bold text-white">장바구니가 비어있습니다</h1>
        <p className="text-sm text-white/40">상품을 담아보세요</p>
        <Link
          href="/products"
          className="btn-gradient mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold gradient-text">장바구니</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass flex items-center gap-4 rounded-2xl p-5"
          >
            {/* 이미지 */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.03]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl text-white/10">🐰</span>
              )}
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item.name}
              </p>
              <p className="mt-1 text-sm font-bold text-violet-400">
                {item.price.toLocaleString()}원
              </p>
            </div>

            {/* 수량 조절 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium text-white">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* 소계 + 삭제 */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/70">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div className="glass mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">
            총 {items.reduce((s, i) => s + i.quantity, 0)}개 상품
          </span>
          <div className="text-right">
            <p className="text-sm text-white/40">총 금액</p>
            <p className="text-2xl font-bold text-violet-400">
              {totalPrice().toLocaleString()}
              <span className="text-sm font-medium">원</span>
            </p>
          </div>
        </div>
        <Link
          href="/checkout"
          className="btn-gradient mt-5 block w-full rounded-xl py-3.5 text-center text-sm font-semibold text-white"
        >
          주문하기
        </Link>
      </div>
    </div>
  );
}
