"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

interface Order {
  id: string;
  totalAmount: number;
  recipientName: string;
  phone: string;
  address: string;
  memo: string | null;
  status: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; image: string | null };
  }[];
}

export default function OrderCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      }
    >
      <OrderCompleteContent />
    </Suspense>
  );
}

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders: Order[]) => {
        const found = orders.find((o) => o.id === orderId);
        setOrder(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-white/40">주문 정보를 찾을 수 없습니다.</p>
        <Link href="/products" className="text-sm text-violet-400 hover:underline">
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* 완료 헤더 */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">주문이 완료되었습니다!</h1>
        <p className="mt-2 text-sm text-white/40">
          주문번호: {order.id}
        </p>
      </div>

      {/* 주문 상세 */}
      <div className="space-y-5">
        {/* 상품 정보 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">주문 상품</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/[0.03]">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <span className="text-sm text-white/10">🐰</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.product.name}</p>
                    <p className="text-xs text-white/30">수량 {item.quantity}개</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/70">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-sm text-white/40">결제 금액</span>
            <span className="text-lg font-bold text-violet-400">
              {order.totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">배송 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">수령인</span>
              <span className="text-white">{order.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">연락처</span>
              <span className="text-white">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">주소</span>
              <span className="text-white">{order.address}</span>
            </div>
            {order.memo && (
              <div className="flex justify-between">
                <span className="text-white/40">메모</span>
                <span className="text-white">{order.memo}</span>
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Link
            href="/mypage"
            className="flex-1 rounded-xl border border-white/10 py-3.5 text-center text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            마이페이지
          </Link>
          <Link
            href="/products"
            className="btn-gradient flex-1 rounded-xl py-3.5 text-center text-sm font-semibold text-white"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
