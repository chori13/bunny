"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CommunityWritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/community/${data.id}`);
      } else {
        setError(`[${res.status}] ${data.error}${data.detail ? "\n상세: " + data.detail : ""}`);
        setSubmitting(false);
      }
    } catch (err) {
      setError("네트워크 오류: " + (err instanceof Error ? err.message : String(err)));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold gradient-text">글쓰기</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm font-medium text-red-400">오류 발생</p>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-red-300/80">{error}</pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="input-dark w-full rounded-xl px-4 py-3"
            maxLength={100}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            className="input-dark w-full resize-none rounded-xl px-4 py-3"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="btn-gradient rounded-xl px-8 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 px-8 py-3 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}