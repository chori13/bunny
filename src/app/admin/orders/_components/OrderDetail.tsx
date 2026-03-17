"use client";

import { useState } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Truck,
  PackageCheck,
  Ban,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import StatusBadge, { allowedTransitions, statusMap } from "./StatusBadge";

interface OrderDetailData {
  id: string;
  totalAmount: number;
  status: string;
  recipientName: string;
  phone: string;
  address: string;
  memo: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; image: string | null; price: number };
  }[];
}

interface OrderDetailProps {
  order: OrderDetailData;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>;
}

const actionIcons: Record<string, React.ReactNode> = {
  check: <CheckCircle2 size={14} />,
  truck: <Truck size={14} />,
  "package-check": <PackageCheck size={14} />,
  x: <Ban size={14} />,
};

const actionColors: Record<string, string> = {
  PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
  SHIPPING: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  DELIVERED: "bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
};

export default function OrderDetail({ order, onClose, onStatusChange }: OrderDetailProps) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  const transitions = allowedTransitions[order.status] || [];

  const handleChange = async (newStatus: string) => {
    setChanging(true);
    try {
      await onStatusChange(order.id, newStatus);
    } finally {
      setChanging(false);
      setConfirm(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-2xl border border-white/10 bg-[#16161a] backdrop-blur-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#16161a] flex items-center justify-between px-6 py-4 border-b border-white/5 z-10">
          <div>
            <p className="text-xs text-white/30 font-mono">#{order.id.slice(0, 12)}</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-sm font-semibold text-white">주문 상세</h3>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Delivery Info */}
          <div className="space-y-3">
            <h4 className="text-xs text-white/40 font-medium">배송 정보</h4>
            <div className="space-y-2 rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <InfoRow icon={<User size={13} />} label="수령인" value={order.recipientName} />
              <InfoRow icon={<Phone size={13} />} label="연락처" value={order.phone} />
              <InfoRow icon={<MapPin size={13} />} label="주소" value={order.address} />
              {order.memo && <InfoRow icon={<FileText size={13} />} label="메모" value={order.memo} />}
              {order.paymentId && (
                <InfoRow icon={<CreditCard size={13} />} label="결제ID" value={order.paymentId} />
              )}
              <InfoRow
                icon={<User size={13} />}
                label="주문자"
                value={order.user.name}
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-xs text-white/40 font-medium">
              상품 목록 ({order.items.length}건)
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-3"
                >
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover bg-white/5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-white/30">
                      {item.price.toLocaleString()}원 × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs text-white/60 font-medium flex-shrink-0">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl bg-violet-500/5 border border-violet-500/10 px-4 py-3">
            <span className="text-xs text-white/40">합계</span>
            <span className="text-sm font-bold text-white">
              {order.totalAmount.toLocaleString()}원
            </span>
          </div>

          {/* Status Actions */}
          {transitions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs text-white/40 font-medium">상태 변경</h4>
              <div className="flex gap-2">
                {transitions.map((t) => (
                  <button
                    key={t.status}
                    onClick={() => setConfirm(t.status)}
                    disabled={changing}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${
                      actionColors[t.status] || "bg-white/5 text-white/60 border-white/10"
                    }`}
                  >
                    {actionIcons[t.icon]}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-[10px] text-white/20 pt-2">
            <span>주문: {new Date(order.createdAt).toLocaleString("ko-KR")}</span>
            <span>수정: {new Date(order.updatedAt).toLocaleString("ko-KR")}</span>
          </div>
        </div>

        {/* Confirm Dialog */}
        {confirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-20">
            <div className="rounded-xl border border-white/10 bg-[#1a1a1e] p-6 max-w-xs w-full">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-white">상태 변경 확인</h4>
              </div>
              <p className="text-xs text-white/50 mb-4">
                이 주문을{" "}
                <span className="text-white font-medium">
                  {statusMap[confirm]?.label || confirm}
                </span>
                (으)로 변경하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  disabled={changing}
                  className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:bg-white/5 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleChange(confirm)}
                  disabled={changing}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white font-medium transition-all disabled:opacity-50"
                >
                  {changing ? <Loader2 size={12} className="animate-spin" /> : null}
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-white/20 mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-[11px] text-white/30 min-w-[45px] flex-shrink-0">{label}</span>
      <span className="text-xs text-white/60">{value}</span>
    </div>
  );
}
