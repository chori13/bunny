"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          장바구니가 비어있습니다
        </h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">장바구니</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                🐰
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-orange-500">
                  {item.price.toLocaleString()}원
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="h-8 w-8 rounded-full border text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 rounded-full border text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="ml-2 text-sm text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between text-lg font-bold">
          <span>총 금액</span>
          <span className="text-orange-500">
            {totalPrice().toLocaleString()}원
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 block rounded-full bg-orange-500 py-3 text-center font-semibold text-white hover:bg-orange-600"
        >
          주문하기
        </Link>
      </div>
    </div>
  );
}
