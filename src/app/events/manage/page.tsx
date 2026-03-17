"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  desc: string;
  period: string;
  icon: string;
  color: string | null;
  status: string;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "진행중",
  UPCOMING: "예정",
  ENDED: "종료",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-violet-500/20 text-violet-400",
  UPCOMING: "bg-yellow-500/20 text-yellow-400",
  ENDED: "bg-white/10 text-white/40",
};

const colorOptions = [
  { value: "", label: "없음" },
  { value: "violet", label: "바이올렛" },
  { value: "emerald", label: "에메랄드" },
  { value: "blue", label: "블루" },
];

export default function EventManagePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [period, setPeriod] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [eventStatus, setEventStatus] = useState("ACTIVE");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/mypage");
      return;
    }
    fetchEvents();
  }, [authStatus, session, router]);

  const fetchEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setPeriod("");
    setIcon("");
    setColor("");
    setEventStatus("ACTIVE");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setTitle(event.title);
    setDesc(event.desc);
    setPeriod(event.period);
    setIcon(event.icon);
    setColor(event.color || "");
    setEventStatus(event.status);
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc || !period || !icon) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    const body = { title, desc, period, icon, color, status: eventStatus };

    const url = editingId ? `/api/events/${editingId}` : "/api/events";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert(editingId ? "이벤트가 수정되었습니다." : "이벤트가 등록되었습니다.");
    resetForm();
    fetchEvents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 이벤트를 삭제하시겠습니까?`)) return;

    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    alert("이벤트가 삭제되었습니다.");
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Link href="/mypage" className="mb-2 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">
            &larr; 마이페이지
          </Link>
          <h1 className="text-3xl font-bold gradient-text">이벤트 관리</h1>
          <p className="mt-2 text-sm text-white/40">이벤트를 등록, 수정, 삭제할 수 있습니다</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            + 이벤트 등록
          </button>
        )}
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass mb-8 rounded-2xl p-8 space-y-5">
          <h2 className="text-lg font-bold text-white">
            {editingId ? "이벤트 수정" : "새 이벤트 등록"}
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
                placeholder="이벤트 제목"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">아이콘 *</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
                placeholder="🎁"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/70">설명 *</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="input-dark w-full rounded-xl px-4 py-3 resize-none"
              placeholder="이벤트 설명을 입력하세요"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">기간 *</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
                placeholder="2026.03.01 ~ 2026.04.30"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">상태</label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
              >
                <option value="ACTIVE">진행중</option>
                <option value="UPCOMING">예정</option>
                <option value="ENDED">종료</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">색상</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input-dark w-full rounded-xl px-4 py-3"
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "처리 중..." : editingId ? "수정 완료" : "등록"}
            </button>
          </div>
        </form>
      )}

      {/* 이벤트 목록 */}
      {events.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-white/40">등록된 이벤트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="glass flex items-center gap-5 rounded-2xl p-5"
            >
              <span className="shrink-0 text-3xl">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">{event.title}</h3>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColors[event.status]}`}>
                    {statusLabels[event.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/40 line-clamp-1">{event.desc}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-white/30">
                  <span>📅</span>
                  <span>{event.period}</span>
                  {event.color && (
                    <>
                      <span className="text-white/10">|</span>
                      <span>색상: {event.color}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(event.id, event.title)}
                  className="rounded-xl border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
