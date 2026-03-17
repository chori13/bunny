"use client";

import { useState } from "react";
import {
  X,
  Star,
  User,
  Package,
  Calendar,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ReviewDetailData {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string | null };
  product: { id: string; name: string; image: string | null; price: number };
}

interface ReviewDetailProps {
  review: ReviewDetailData;
  onClose: () => void;
  onDelete: (reviewId: string) => Promise<void>;
}

export default function ReviewDetail({ review, onClose, onDelete }: ReviewDetailProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(review.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative rounded-2xl border border-white/10 bg-[#16161a] backdrop-blur-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#16161a] flex items-center justify-between px-6 py-4 border-b border-white/5 z-10">
          <div>
            <p className="text-xs text-white/30 font-mono">#{review.id.slice(0, 12)}</p>
            <h3 className="text-sm font-semibold text-white mt-0.5">리뷰 상세</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={16} className="text-white/40" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Product Info */}
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/5 p-4">
            {review.product.image ? (
              <img
                src={review.product.image}
                alt={review.product.name}
                className="h-14 w-14 rounded-xl object-cover bg-white/5 flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center">
                <Package size={20} className="text-white/10" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-white/80 font-medium truncate">{review.product.name}</p>
              <p className="text-xs text-white/30 mt-0.5">
                {review.product.price.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <h4 className="text-xs text-white/40 font-medium">평점</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-white/10"}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-white">{review.rating}</span>
              <span className="text-xs text-white/30">/ 5</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h4 className="text-xs text-white/40 font-medium">리뷰 내용</h4>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
              {review.content ? (
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
              ) : (
                <p className="text-xs text-white/20 italic">(내용 없음)</p>
              )}
            </div>
          </div>

          {/* Writer Info */}
          <div className="space-y-2">
            <h4 className="text-xs text-white/40 font-medium">작성자 정보</h4>
            <div className="space-y-2 rounded-xl bg-white/[0.03] border border-white/5 p-4">
              <div className="flex items-start gap-2">
                <User size={13} className="text-white/20 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-white/30 min-w-[45px] flex-shrink-0">작성자</span>
                <span className="text-xs text-white/60">{review.user.name}</span>
              </div>
              {review.user.email && (
                <div className="flex items-start gap-2">
                  <User size={13} className="text-white/20 mt-0.5 flex-shrink-0" />
                  <span className="text-[11px] text-white/30 min-w-[45px] flex-shrink-0">이메일</span>
                  <span className="text-xs text-white/60">{review.user.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={13} className="text-white/20 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-white/30 min-w-[45px] flex-shrink-0">작성일</span>
                <span className="text-xs text-white/60">
                  {new Date(review.createdAt).toLocaleString("ko-KR")}
                </span>
              </div>
            </div>
          </div>

          {/* Delete Action */}
          <div className="space-y-3">
            <h4 className="text-xs text-white/40 font-medium">관리</h4>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
            >
              <Trash2 size={12} />
              리뷰 삭제
            </button>
          </div>
        </div>

        {/* Delete Confirm Dialog */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-20">
            <div className="rounded-xl border border-white/10 bg-[#1a1a1e] p-6 max-w-xs w-full">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-400" />
                <h4 className="text-sm font-semibold text-white">리뷰 삭제 확인</h4>
              </div>
              <p className="text-xs text-white/50 mb-1">
                <span className="text-white font-medium">{review.user.name}</span>
                님이 작성한 리뷰를 삭제하시겠습니까?
              </p>
              <p className="text-[10px] text-red-400/60 mb-4">
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 px-3 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:bg-white/5 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-xs text-white font-medium transition-all disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
