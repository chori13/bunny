"use client";

import { AlertTriangle } from "lucide-react";
import type { HttpMethod } from "./api-data";
import MethodBadge from "./MethodBadge";

interface ConfirmModalProps {
  method: HttpMethod;
  path: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ method, path, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold">요청 확인</h3>
        </div>

        <p className="text-white/60 text-sm mb-4">
          이 요청은 데이터를 변경할 수 있습니다. 계속하시겠습니까?
        </p>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-6">
          <MethodBadge method={method} />
          <code className="text-xs text-white/50 truncate">{path}</code>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all"
          >
            실행
          </button>
        </div>
      </div>
    </div>
  );
}
