"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Pencil, X, Check } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
  userId: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
  user: { name: string };
  comments: Comment[];
}

export default function CommunityDetailPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const isAuthor = session?.user?.id === post?.userId;
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch(`/api/community/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;

    const res = await fetch(`/api/community/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/community");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditMode(true);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleEditSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/community/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
    });

    if (res.ok) {
      const updated = await res.json();
      setPost((prev) => (prev ? { ...prev, title: updated.title, content: updated.content } : prev));
      setEditMode(false);
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setSaving(false);
  };

  const handleCommentEdit = async (commentId: string) => {
    if (!editingCommentContent.trim()) return;
    const res = await fetch(`/api/community/${id}/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editingCommentContent.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPost((prev) =>
        prev
          ? { ...prev, comments: prev.comments.map((c) => (c.id === commentId ? { ...c, content: updated.content } : c)) }
          : prev
      );
      setEditingCommentId(null);
      setEditingCommentContent("");
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/community/${id}/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setPost((prev) =>
        prev ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) } : prev
      );
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const res = await fetch(`/api/community/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev
      );
      setComment("");
    } else {
      const data = await res.json();
      alert(data.error);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-white/40">게시글을 찾을 수 없습니다.</p>
        <Link
          href="/community"
          className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:bg-white/5"
        >
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/community"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
      >
        <ArrowLeft size={16} />
        목록으로
      </Link>

      {/* 게시글 */}
      <article className="glass rounded-2xl p-8">
        {editMode ? (
          /* 수정 모드 */
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="input-dark w-full rounded-xl px-4 py-3 text-lg font-bold"
              placeholder="제목을 입력하세요"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={10}
              className="input-dark w-full rounded-xl px-4 py-3 text-sm leading-relaxed"
              placeholder="내용을 입력하세요"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleEditCancel}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <X size={15} />
                취소
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="btn-gradient flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Check size={15} />
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        ) : (
          /* 보기 모드 */
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-white/40">
                  <span>{post.user.name}</span>
                  <span>·</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {(isAuthor || isAdmin) && (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={handleEdit}
                    className="rounded-xl border border-white/10 p-2.5 text-white/40 transition hover:bg-white/5 hover:text-white/70"
                    title="수정"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-xl border border-red-500/20 p-2.5 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
              {post.content}
            </div>
          </>
        )}
      </article>

      {/* 댓글 섹션 */}
      <section className="mt-8">
        <h2 className="mb-5 text-lg font-bold text-white">
          댓글 {post.comments.length}
        </h2>

        {/* 댓글 목록 */}
        {post.comments.length > 0 ? (
          <div className="mb-6 space-y-3">
            {post.comments.map((c) => {
              const isCommentAuthor = session?.user?.id === c.userId;
              const canEditComment = isCommentAuthor || isAdmin;

              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span className="font-medium text-white/60">{c.user.name}</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                    </div>
                    {canEditComment && editingCommentId !== c.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingCommentId(c.id); setEditingCommentContent(c.content); }}
                          className="rounded-lg p-1 text-white/25 transition hover:bg-white/5 hover:text-white/50"
                          title="수정"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleCommentDelete(c.id)}
                          className="rounded-lg p-1 text-white/25 transition hover:bg-red-500/10 hover:text-red-400"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === c.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="input-dark flex-1 rounded-lg px-3 py-2 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleCommentEdit(c.id)}
                        className="rounded-lg bg-violet-500/20 px-3 py-2 text-xs font-medium text-violet-400 transition hover:bg-violet-500/30"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => { setEditingCommentId(null); setEditingCommentContent(""); }}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:bg-white/5"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-white/60">{c.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mb-6 text-sm text-white/30">아직 댓글이 없습니다.</p>
        )}

        {/* 댓글 작성 */}
        {session ? (
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="input-dark flex-1 rounded-xl px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="btn-gradient shrink-0 rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {submitting ? "..." : "등록"}
            </button>
          </form>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <Link
              href="/login"
              className="text-sm text-violet-400 hover:underline"
            >
              로그인하고 댓글을 남겨보세요
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
