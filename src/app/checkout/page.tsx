"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import * as PortOne from "@portone/browser-sdk/v2";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [form, setForm] = useState({
    recipientName: "",
    phone: "",
    address: "",
    memo: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<Array<{
    id: string; recipientName: string; phone: string; address: string; memo: string; isDefault: boolean;
  }>>([]);

  useEffect(() => {
    fetch("/api/user/address")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses?.length > 0) {
          setSavedAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: { isDefault: boolean }) => a.isDefault) || data.addresses[0];
          setForm({
            recipientName: defaultAddr.recipientName,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            memo: defaultAddr.memo || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-6xl">📦</p>
        <p className="text-white/40">주문할 상품이 없습니다.</p>
        <Link
          href="/products"
          className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
        >
          쇼핑하러 가기
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async () => {
    if (!form.recipientName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError("수령인, 연락처, 주소를 입력해주세요.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // 1. 주문 생성
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          ...form,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || "주문 생성 실패");
      }

      const order = await orderRes.json();

      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;

      if (!storeId) {
        // 테스트 모드: 포트원 키 없으면 바로 결제 완료 처리
        const verifyRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: `test_${Date.now()}`,
            orderId: order.id,
          }),
        });

        if (!verifyRes.ok) {
          const data = await verifyRes.json();
          throw new Error(data.error || "결제 처리 실패");
        }

        clearCart();
        router.push(`/orders/complete?orderId=${order.id}`);
        return;
      }

      // 2. 포트원 결제 요청
      const paymentResponse = await PortOne.requestPayment({
        storeId,
        channelKey: "channel-key-placeholder",
        paymentId: `payment_${order.id}_${Date.now()}`,
        orderName:
          items.length === 1
            ? items[0].name
            : `${items[0].name} 외 ${items.length - 1}건`,
        totalAmount: totalPrice(),
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        customer: {
          fullName: form.recipientName,
          phoneNumber: form.phone,
        },
      });

      if (!paymentResponse || paymentResponse.code) {
        throw new Error(paymentResponse?.message || "결제가 취소되었습니다.");
      }

      // 3. 서버에서 결제 검증
      const verifyRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentResponse.paymentId,
          orderId: order.id,
        }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error || "결제 검증 실패");
      }

      // 4. 완료
      clearCart();
      router.push(`/orders/complete?orderId=${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "결제 중 오류가 발생했습니다.");
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold gradient-text">주문서</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* 주문 상품 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">주문 상품</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/[0.03]">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <span className="text-sm text-white/10">🐰</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.name}</p>
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
            <span className="text-sm text-white/40">총 금액</span>
            <span className="text-lg font-bold text-violet-400">
              {totalPrice().toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 배송 정보 */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-semibold text-white/60">배송 정보</h2>
          {savedAddresses.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setForm({ recipientName: addr.recipientName, phone: addr.phone, address: addr.address, memo: addr.memo || "" })}
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    form.address === addr.address
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                      : "border-white/10 text-white/50 hover:bg-white/5"
                  }`}
                >
                  {addr.recipientName} · {addr.address.slice(0, 15)}...
                </button>
              ))}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/40">수령인 *</label>
              <input
                type="text"
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                placeholder="받으시는 분 이름"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">연락처 *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">배송지 *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="배송 받으실 주소"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/40">배송 메모</label>
              <textarea
                name="memo"
                value={form.memo}
                onChange={handleChange}
                placeholder="배송 시 요청사항 (선택)"
                rows={2}
                className="input-dark w-full resize-none rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn-gradient w-full rounded-xl py-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          {processing
            ? "결제 처리 중..."
            : `${totalPrice().toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}