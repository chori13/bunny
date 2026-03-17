"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, MapPin, Phone, User, FileText } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; image: string | null };
}

interface Order {
  id: string;
  totalAmount: number;
  recipientName: string;
  phone: string;
  address: string;
  memo: string | null;
  status: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch(`/api/orders/${params.id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "주문을 불러올 수 없습니다.");
        }
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [session, authStatus, router, params.id]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-white/40">{error || "주문을 찾을 수 없습니다."}</p>
        <Link href="/orders" className="text-sm text-violet-400 hover:underline">
          주문 내역으로 돌아가기
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 transition hover:text-white/70"
        >
          <ArrowLeft size={16} />
          주문 내역
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">주문 상세</h1>
            <p className="mt-1 text-xs text-white/30">
              주문번호 {order.id.slice(-8).toUpperCase()} · {orderDate}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="space-y-5">
        {/* 주문 상품 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">주문 상품</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.03]">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <Package size={18} className="text-white/15" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.product.name}</p>
                    <p className="text-xs text-white/30">
                      {item.price.toLocaleString()}원 × {item.quantity}개
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/70">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-sm text-white/40">총 결제 금액</span>
            <span className="text-lg font-bold text-violet-400">
              {order.totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">배송 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <User size={15} className="mt-0.5 shrink-0 text-white/25" />
              <div>
                <p className="text-xs text-white/30">수령인</p>
                <p className="text-white">{order.recipientName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={15} className="mt-0.5 shrink-0 text-white/25" />
              <div>
                <p className="text-xs text-white/30">연락처</p>
                <p className="text-white">{order.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-white/25" />
              <div>
                <p className="text-xs text-white/30">주소</p>
                <p className="text-white">{order.address}</p>
              </div>
            </div>
            {order.memo && (
              <div className="flex items-start gap-3">
                <FileText size={15} className="mt-0.5 shrink-0 text-white/25" />
                <div>
                  <p className="text-xs text-white/30">배송 메모</p>
                  <p className="text-white">{order.memo}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="flex-1 rounded-xl border border-white/10 py-3.5 text-center text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            주문 내역
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
