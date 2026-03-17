"use client";

export const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "bg-yellow-500/15 text-yellow-400" },
  PAID: { label: "결제완료", color: "bg-emerald-500/15 text-emerald-400" },
  SHIPPING: { label: "배송중", color: "bg-blue-500/15 text-blue-400" },
  DELIVERED: { label: "배송완료", color: "bg-white/10 text-white/50" },
  CANCELLED: { label: "취소", color: "bg-red-500/15 text-red-400" },
};

export const allowedTransitions: Record<string, { status: string; label: string; icon: string }[]> = {
  PENDING: [
    { status: "PAID", label: "결제 확인", icon: "check" },
    { status: "CANCELLED", label: "주문 취소", icon: "x" },
  ],
  PAID: [
    { status: "SHIPPING", label: "배송 처리", icon: "truck" },
    { status: "CANCELLED", label: "주문 취소", icon: "x" },
  ],
  SHIPPING: [
    { status: "DELIVERED", label: "배송 완료", icon: "package-check" },
  ],
  DELIVERED: [],
  CANCELLED: [],
};

export default function StatusBadge({ status }: { status: string }) {
  const st = statusMap[status] || statusMap.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${st.color}`}>
      {st.label}
    </span>
  );
}
