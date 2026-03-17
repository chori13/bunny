"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
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
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, authStatus, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold gradient-text">주문 내역</h1>
        <p className="mt-2 text-sm text-white/40">나의 주문 목록을 확인하세요</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.03]">
            <ShoppingBag size={36} className="text-white/15" />
          </div>
          <div className="text-center">
            <p className="text-white/40">주문 내역이 없습니다</p>
            <p className="mt-1 text-sm text-white/20">쇼핑을 시작해보세요!</p>
          </div>
          <Link
            href="/products"
            className="btn-gradient rounded-xl px-8 py-3 text-sm font-semibold text-white"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const extraCount = order.items.length - 1;
            const orderDate = new Date(order.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="glass block rounded-2xl p-5 transition hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 상태 + 날짜 */}
                    <div className="flex items-center gap-2 mb-3">
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-white/30">{orderDate}</span>
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/[0.03]">
                        {firstItem?.product.image ? (
                          <Image
                            src={firstItem.product.image}
                            alt={firstItem.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package size={18} className="text-white/15" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {firstItem?.product.name}
                          {extraCount > 0 && (
                            <span className="text-white/40"> 외 {extraCount}건</span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-white/30">
                          주문번호 {order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 금액 + 화살표 */}
                  <div className="flex items-center gap-2 pl-4">
                    <span className="text-sm font-bold text-violet-400">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
