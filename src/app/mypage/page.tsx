"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, MessageSquare, Heart, Settings, Check, X } from "lucide-react";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    // 프로필 정보 불러오기
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setEmail(data.email);
      })
      .catch(() => {});
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const handleSave = async () => {
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: "error", text: "새 비밀번호는 6자 이상이어야 합니다." });
      return;
    }

    if (newPassword && !currentPassword) {
      setMessage({ type: "error", text: "현재 비밀번호를 입력해주세요." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "프로필이 수정되었습니다." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setEditMode(false);
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold gradient-text">My Page</h1>
          <p className="mt-2 text-sm text-white/40">내 계정 정보</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6">
          {/* 프로필 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/20 text-xl font-bold text-violet-400">
                {session.user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white/40">아이디</p>
                <p className="text-lg font-semibold text-white">{session.user?.name}</p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white/60"
                title="프로필 수정"
              >
                <Settings size={18} />
              </button>
            )}
          </div>

          {/* 알림 메시지 */}
          {message && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 수정 모드 */}
          {editMode && (
            <div className="space-y-4 border-t border-white/5 pt-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/40">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  className="input-dark w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div className="pt-2">
                <p className="mb-3 text-xs font-medium text-white/40">비밀번호 변경 (선택)</p>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호"
                    className="input-dark w-full rounded-xl px-4 py-3 text-sm"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (6자 이상)"
                    className="input-dark w-full rounded-xl px-4 py-3 text-sm"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="input-dark w-full rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={15} />
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-gradient flex flex-1 items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  <Check size={15} />
                  {saving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          )}

          {/* 메뉴 */}
          <div className="border-t border-white/5 pt-6 space-y-3">
            <Link
              href="/orders"
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <Package size={16} />
              주문 내역
            </Link>
            <Link
              href="/wishlist"
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <Heart size={16} />
              찜한 상품
            </Link>
            <Link
              href="/community"
              className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <MessageSquare size={16} />
              내 게시글
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
