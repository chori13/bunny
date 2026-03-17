"use client";

import { useState } from "react";
import {
  X,
  Shield,
  User as UserIcon,
  ShoppingBag,
  Star,
  FileText,
  MessageSquare,
  Heart,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface UserDetailData {
  id: string;
  name: string;
  email: string | null;
  role: string;
  totalSpent: number;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    product: { name: string };
  }[];
  posts: {
    id: string;
    title: string;
    createdAt: string;
  }[];
  _count: {
    orders: number;
    reviews: number;
    posts: number;
    comments: number;
    wishlists: number;
  };
}

interface UserDetailProps {
  user: UserDetailData;
  currentUserId: string;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "대기", color: "text-yellow-400" },
  PAID: { label: "결제완료", color: "text-emerald-400" },
  SHIPPING: { label: "배송중", color: "text-blue-400" },
  DELIVERED: { label: "배송완료", color: "text-white/50" },
  CANCELLED: { label: "취소", color: "text-red-400" },
};

export default function UserDetail({ user, currentUserId, onClose, onRoleChange }: UserDetailProps) {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);
  const isSelf = user.id === currentUserId;

  const handleRoleChange = async (newRole: string) => {
    setChanging(true);
    try {
      await onRoleChange(user.id, newRole);
    } finally {
      setChanging(false);
      setConfirm(null);
    }
  };

  const stats = [
    { icon: ShoppingBag, label: "주문", value: user._count.orders, color: "text-blue-400" },
    { icon: Star, label: "리뷰", value: user._count.reviews, color: "text-amber-400" },
    { icon: FileText, label: "게시글", value: user._count.posts, color: "text-emerald-400" },
    { icon: MessageSquare, label: "댓글", value: user._count.comments, color: "text-cyan-400" },
    { icon: Heart, label: "위시리스트", value: user._count.wishlists, color: "text-rose-400" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-2xl border border-white/10 bg-[#16161a] backdrop-blur-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#16161a] flex items-center justify-between px-6 py-4 border-b border-white/5 z-10">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                user.role === "ADMIN"
                  ? "bg-violet-500/20 text-violet-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{user.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {user.role === "ADMIN" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-violet-400">
                    <Shield size={10} />
                    관리자
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                    <UserIcon size={10} />
                    일반회원
                  </span>
                )}
                {user.email && (
                  <span className="text-[10px] text-white/20">{user.email}</span>
                )}
              </div>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
                <s.icon size={14} className={`mx-auto mb-1 ${s.color}`} />
                <p className="text-sm font-bold text-white">{s.value}</p>
                <p className="text-[9px] text-white/25">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Total Spent */}
          <div className="flex items-center justify-between rounded-xl bg-violet-500/5 border border-violet-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-violet-400" />
              <span className="text-xs text-white/40">총 구매 금액</span>
            </div>
            <span className="text-sm font-bold text-white">
              {user.totalSpent.toLocaleString()}원
            </span>
          </div>

          {/* Recent Orders */}
          {user.orders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-white/40 font-medium">최근 주문</h4>
              <div className="space-y-1.5">
                {user.orders.slice(0, 5).map((order) => {
                  const st = statusMap[order.status] || statusMap.PENDING;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/20 font-mono">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className={`text-[10px] font-bold ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/60 font-medium">
                          {order.totalAmount.toLocaleString()}원
                        </span>
                        <span className="text-[10px] text-white/20">
                          {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Reviews */}
          {user.reviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs text-white/40 font-medium">최근 리뷰</h4>
              <div className="space-y-1.5">
                {user.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-white/50">{review.product.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={9}
                            className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/10"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-white/30 truncate">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Role Change */}
          {!isSelf && (
            <div className="space-y-3">
              <h4 className="text-xs text-white/40 font-medium">역할 변경</h4>
              <div className="flex gap-2">
                {user.role !== "ADMIN" && (
                  <button
                    onClick={() => setConfirm("ADMIN")}
                    disabled={changing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30"
                  >
                    <Shield size={12} />
                    관리자로 변경
                  </button>
                )}
                {user.role !== "USER" && (
                  <button
                    onClick={() => setConfirm("USER")}
                    disabled={changing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                  >
                    <UserIcon size={12} />
                    일반회원으로 변경
                  </button>
                )}
              </div>
            </div>
          )}

          {isSelf && (
            <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3">
              <p className="text-xs text-amber-400/70">
                현재 로그인한 계정입니다. 자신의 역할은 변경할 수 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* Confirm Dialog */}
        {confirm && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-20">
            <div className="rounded-xl border border-white/10 bg-[#1a1a1e] p-6 max-w-xs w-full">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-400" />
                <h4 className="text-sm font-semibold text-white">역할 변경 확인</h4>
              </div>
              <p className="text-xs text-white/50 mb-4">
                <span className="text-white font-medium">{user.name}</span>
                님을{" "}
                <span className="text-white font-medium">
                  {confirm === "ADMIN" ? "관리자" : "일반회원"}
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
                  onClick={() => handleRoleChange(confirm)}
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
