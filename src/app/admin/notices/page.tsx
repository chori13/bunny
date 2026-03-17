"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Send,
  X,
  Check,
  Bell,
  Monitor,
  Mail,
  Search,
  Users,
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
}

const typeLabels: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  GENERAL: { label: "일반", color: "bg-white/10 text-white/50", icon: Bell },
  POPUP: { label: "팝업", color: "bg-violet-500/15 text-violet-400", icon: Monitor },
  EMAIL: { label: "이메일", color: "bg-blue-500/15 text-blue-400", icon: Mail },
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "GENERAL", isActive: true });
  const [saving, setSaving] = useState(false);

  // 발송 대상 선택 팝업
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalSearch, setModalSearch] = useState("");
  const [modalSelectedIds, setModalSelectedIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 폼에서 선택된 발송 대상 (팝업 확인 후 저장)
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);

  // 팝업 미리보기
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);

  // 이메일 발송 (목록에서)
  const [emailNotice, setEmailNotice] = useState<Notice | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<string | null>(null);

  const fetchNotices = () => {
    fetch("/api/admin/notices")
      .then((res) => res.json())
      .then((data) => {
        setNotices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotices(); }, []);

  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch("/api/admin/users?limit=100")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.users ?? [];
        setModalUsers(list);
        setLoadingUsers(false);
      })
      .catch(() => setLoadingUsers(false));
  };

  const resetForm = () => {
    setForm({ title: "", content: "", type: "GENERAL", isActive: true });
    setEditingId(null);
    setShowForm(false);
    setSelectedRecipients([]);
  };

  const handleEdit = (notice: Notice) => {
    setForm({ title: notice.title, content: notice.content, type: notice.type, isActive: notice.isActive });
    setEditingId(notice.id);
    setShowForm(true);
    setSelectedRecipients([]);
  };

  // 발송 결과 (폼 내)
  const [formSendResult, setFormSendResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (form.type === "EMAIL" && selectedRecipients.length === 0) return;
    setSaving(true);
    setFormSendResult(null);

    const url = editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      // 이메일 유형이면 저장 후 자동 발송
      if (form.type === "EMAIL" && selectedRecipients.length > 0) {
        const data = await res.json();
        const noticeId = editingId || data.id;
        if (noticeId) {
          const emailRes = await fetch("/api/admin/notices/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noticeId, userIds: selectedRecipients.map((u) => u.id) }),
          });
          const emailData = await emailRes.json();
          const hint = emailData.hint ? `\n${emailData.hint}` : "";
          setFormSendResult((emailData.message || emailData.error) + hint);
          setSaving(false);
          fetchNotices();
          return;
        }
      }
      resetForm();
      fetchNotices();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("공지사항을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
    if (res.ok) fetchNotices();
  };

  const handleToggleActive = async (notice: Notice) => {
    await fetch(`/api/admin/notices/${notice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !notice.isActive }),
    });
    fetchNotices();
  };

  // 발송 대상 선택 팝업 열기
  const openUserSelectModal = () => {
    setModalSearch("");
    setModalSelectedIds(new Set(selectedRecipients.map((u) => u.id)));
    setShowUserModal(true);
    if (modalUsers.length === 0) fetchUsers();
  };

  // 팝업에서 확인 클릭
  const confirmUserSelection = () => {
    const selected = modalUsers.filter((u) => modalSelectedIds.has(u.id));
    setSelectedRecipients(selected);
    setShowUserModal(false);
  };

  // 이메일 발송 모달 (목록에서)
  const openEmailModal = (notice: Notice) => {
    setEmailNotice(notice);
    setModalSelectedIds(new Set());
    setEmailResult(null);
    if (modalUsers.length === 0) fetchUsers();
  };

  const handleSendEmail = async () => {
    if (!emailNotice || modalSelectedIds.size === 0) return;
    setSendingEmail(true);
    setEmailResult(null);

    const res = await fetch("/api/admin/notices/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noticeId: emailNotice.id, userIds: [...modalSelectedIds] }),
    });

    const data = await res.json();
    setEmailResult(data.message || data.error);
    setSendingEmail(false);
  };

  const filteredModalUsers = modalUsers.filter((u) => {
    const q = modalSearch.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || (u.email?.toLowerCase().includes(q) ?? false);
  });

  const toggleModalSelectAll = () => {
    const filteredIds = filteredModalUsers.map((u) => u.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => modalSelectedIds.has(id));
    setModalSelectedIds((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">공지사항 관리</h1>
          <p className="mt-1 text-sm text-white/40">총 {notices.length}건</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          공지 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="glass mb-8 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">
              {editingId ? "공지 수정" : "새 공지 등록"}
            </h2>
            <button onClick={resetForm} className="text-white/30 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-5">
            {/* 제목 */}
            <div className="flex items-center gap-4">
              <label className="w-20 shrink-0 text-sm font-medium text-white/70">제목</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="공지사항 제목을 입력하세요"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* 내용 */}
            <div className="flex gap-4">
              <label className="w-20 shrink-0 pt-3 text-sm font-medium text-white/70">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="공지사항 내용을 입력하세요"
                rows={5}
                className="input-dark w-full resize-none rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* 유형 */}
            <div className="flex items-center gap-4">
              <label className="w-20 shrink-0 text-sm font-medium text-white/70">유형</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {(["GENERAL", "POPUP", "EMAIL"] as const).map((t) => {
                    const info = typeLabels[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          form.type === t ? info.color : "bg-white/5 text-white/30"
                        }`}
                      >
                        {info.label}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="accent-violet-500"
                  />
                  활성화
                </label>
              </div>
            </div>

            {/* 이메일 유형: 발송 대상 */}
            {form.type === "EMAIL" && (
              <div className="flex gap-4">
                <label className="w-20 shrink-0 pt-2 text-sm font-medium text-white/70">발송 대상</label>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={openUserSelectModal}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50 transition hover:border-violet-500/30 hover:bg-violet-500/5"
                  >
                    <Users size={16} />
                    {selectedRecipients.length > 0
                      ? `${selectedRecipients.length}명 선택됨`
                      : "회원 선택하기"}
                  </button>
                  {/* 선택된 회원 태그 */}
                  {selectedRecipients.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRecipients.map((u) => (
                        <span
                          key={u.id}
                          className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                        >
                          {u.name}
                          <span className="text-white/30">{u.email || "이메일 없음"}</span>
                          <button
                            onClick={() => setSelectedRecipients((prev) => prev.filter((r) => r.id !== u.id))}
                            className="ml-0.5 text-white/30 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 발송 결과 */}
            {formSendResult && (
              <div className="ml-24 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                {formSendResult}
              </div>
            )}

            <div className="flex gap-3 pt-2 pl-24">
              <button
                onClick={handleSubmit}
                disabled={
                  saving ||
                  !form.title.trim() ||
                  !form.content.trim() ||
                  (form.type === "EMAIL" && selectedRecipients.length === 0)
                }
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 ${
                  form.type === "EMAIL"
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "btn-gradient"
                }`}
              >
                {form.type === "EMAIL" && <Send size={14} />}
                {saving
                  ? form.type === "EMAIL" ? "발송 중..." : "저장 중..."
                  : form.type === "EMAIL"
                    ? `${selectedRecipients.length}명에게 발송`
                    : editingId ? "수정" : "등록"}
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm text-white/50 transition hover:bg-white/5"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {notices.length === 0 ? (
        <p className="py-16 text-center text-sm text-white/30">등록된 공지사항이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => {
            const info = typeLabels[notice.type] || typeLabels.GENERAL;
            const Icon = info.icon;
            return (
              <div key={notice.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${info.color}`}>
                        <Icon size={11} />
                        {info.label}
                      </span>
                      {!notice.isActive && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">
                          비활성
                        </span>
                      )}
                      <span className="text-xs text-white/20">
                        {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-white">{notice.title}</h3>
                    <p className="mt-1 text-xs text-white/40 line-clamp-2">{notice.content}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {notice.type === "POPUP" && (
                      <button
                        onClick={() => setPreviewNotice(notice)}
                        className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
                        title="팝업 미리보기"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEmailModal(notice)}
                      className="rounded-lg p-2 text-white/30 transition hover:bg-blue-500/10 hover:text-blue-400"
                      title="이메일 발송"
                    >
                      <Send size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(notice)}
                      className={`rounded-lg p-2 transition ${
                        notice.isActive
                          ? "text-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                          : "text-white/20 hover:bg-white/5 hover:text-white/50"
                      }`}
                      title={notice.isActive ? "비활성화" : "활성화"}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(notice)}
                      className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
                      title="수정"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 팝업 미리보기 모달 */}
      {previewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#16161a] p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-base font-bold text-white">공지사항</h3>
              <button
                onClick={() => setPreviewNotice(null)}
                className="rounded-lg p-1 text-white/40 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <h4 className="text-lg font-semibold text-white">{previewNotice.title}</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/60">
                {previewNotice.content}
              </p>
            </div>
            <div className="flex justify-end border-t border-white/10 px-6 py-4">
              <button
                onClick={() => setPreviewNotice(null)}
                className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 발송 대상 선택 팝업 */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#16161a] shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-white">발송 대상 선택</h3>
                <p className="mt-0.5 text-xs text-white/40">
                  회원 목록에서 이메일 발송 대상을 선택하세요
                </p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="rounded-lg p-1 text-white/40 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* 검색 + 전체 선택 */}
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="이름 또는 이메일로 검색"
                  className="input-dark w-full rounded-lg py-2 pl-9 pr-3 text-xs"
                />
              </div>
              <button
                onClick={toggleModalSelectAll}
                className="shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs text-violet-400 transition hover:bg-violet-500/10"
              >
                {filteredModalUsers.length > 0 && filteredModalUsers.every((u) => modalSelectedIds.has(u.id))
                  ? "전체 해제"
                  : "전체 선택"}
              </button>
              <span className="shrink-0 rounded-full bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-400">
                {modalSelectedIds.size}명
              </span>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[40px_1fr_1.2fr_80px] gap-2 border-b border-white/5 px-6 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              <span />
              <span>이름</span>
              <span>이메일</span>
              <span className="text-center">권한</span>
            </div>

            {/* 회원 목록 */}
            <div className="max-h-[360px] overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
              ) : filteredModalUsers.length === 0 ? (
                <p className="py-12 text-center text-sm text-white/30">
                  {modalSearch ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                </p>
              ) : (
                filteredModalUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`grid cursor-pointer grid-cols-[40px_1fr_1.2fr_80px] items-center gap-2 px-6 py-3 transition ${
                      modalSelectedIds.has(user.id)
                        ? "bg-violet-500/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={modalSelectedIds.has(user.id)}
                      onChange={() => {
                        setModalSelectedIds((prev) => {
                          const next = new Set(prev);
                          next.has(user.id) ? next.delete(user.id) : next.add(user.id);
                          return next;
                        });
                      }}
                      className="accent-violet-500"
                    />
                    <span className="truncate text-sm text-white">{user.name}</span>
                    <span className="truncate text-sm text-white/40">
                      {user.email || (
                        <span className="text-yellow-400/60">이메일 미등록</span>
                      )}
                    </span>
                    <span className="text-center">
                      {user.role === "ADMIN" ? (
                        <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                          관리자
                        </span>
                      ) : (
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                          회원
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>

            {/* 푸터 */}
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <p className="text-xs text-white/30">
                총 {filteredModalUsers.length}명 중 {modalSelectedIds.size}명 선택
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/5"
                >
                  취소
                </button>
                <button
                  onClick={confirmUserSelection}
                  disabled={modalSelectedIds.size === 0}
                  className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {modalSelectedIds.size}명 선택 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 이메일 발송 모달 (목록에서 직접 발송) */}
      {emailNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#16161a] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-white">이메일 발송</h3>
                <p className="mt-0.5 text-xs text-white/40">{emailNotice.title}</p>
              </div>
              <button
                onClick={() => setEmailNotice(null)}
                className="rounded-lg p-1 text-white/40 transition hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* 검색 + 전체 선택 */}
            <div className="flex items-center gap-3 border-b border-white/10 px-6 py-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="이름 또는 이메일로 검색"
                  className="input-dark w-full rounded-lg py-2 pl-9 pr-3 text-xs"
                />
              </div>
              <button
                onClick={toggleModalSelectAll}
                className="shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs text-violet-400 transition hover:bg-violet-500/10"
              >
                {filteredModalUsers.length > 0 && filteredModalUsers.every((u) => modalSelectedIds.has(u.id))
                  ? "전체 해제"
                  : "전체 선택"}
              </button>
              <span className="shrink-0 rounded-full bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-400">
                {modalSelectedIds.size}명
              </span>
            </div>

            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[40px_1fr_1.2fr_80px] gap-2 border-b border-white/5 px-6 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              <span />
              <span>이름</span>
              <span>이메일</span>
              <span className="text-center">권한</span>
            </div>

            {/* 회원 목록 */}
            <div className="max-h-[320px] overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
              ) : filteredModalUsers.length === 0 ? (
                <p className="py-12 text-center text-sm text-white/30">
                  {modalSearch ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                </p>
              ) : (
                filteredModalUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`grid cursor-pointer grid-cols-[40px_1fr_1.2fr_80px] items-center gap-2 px-6 py-3 transition ${
                      modalSelectedIds.has(user.id)
                        ? "bg-violet-500/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={modalSelectedIds.has(user.id)}
                      onChange={() => {
                        setModalSelectedIds((prev) => {
                          const next = new Set(prev);
                          next.has(user.id) ? next.delete(user.id) : next.add(user.id);
                          return next;
                        });
                      }}
                      className="accent-violet-500"
                    />
                    <span className="truncate text-sm text-white">{user.name}</span>
                    <span className="truncate text-sm text-white/40">
                      {user.email || (
                        <span className="text-yellow-400/60">이메일 미등록</span>
                      )}
                    </span>
                    <span className="text-center">
                      {user.role === "ADMIN" ? (
                        <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400">
                          관리자
                        </span>
                      ) : (
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                          회원
                        </span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>

            {/* 발송 결과 */}
            {emailResult && (
              <div className="mx-6 my-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                {emailResult}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <p className="text-xs text-white/30">
                총 {filteredModalUsers.length}명 중 {modalSelectedIds.size}명 선택
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setEmailNotice(null); setModalSearch(""); }}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/50 transition hover:bg-white/5"
                >
                  닫기
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || modalSelectedIds.size === 0}
                  className="btn-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <Send size={14} />
                  {sendingEmail
                    ? "발송 중..."
                    : `${modalSelectedIds.size}명에게 발송`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}