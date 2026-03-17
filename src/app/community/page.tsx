"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { name: string };
  _count: { comments: number };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/community")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* 헤더 */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">커뮤니티</h1>
          <p className="mt-2 text-sm text-white/40">
            토끼 집사들의 이야기를 나눠보세요
          </p>
        </div>
        {session && (
          <Link
            href="/community/write"
            className="btn-gradient rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            + 글쓰기
          </Link>
        )}
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <p className="text-white/40">아직 게시글이 없습니다.</p>
          {session && (
            <Link
              href="/community/write"
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              첫 번째 글을 작성해보세요
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="glass flex items-center gap-5 rounded-2xl p-5 transition hover:border-violet-500/30"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm text-white/40 line-clamp-1">
                  {post.content}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/30">
                  <span>{post.user.name}</span>
                  <span>·</span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-sm text-white/30">
                <MessageSquare size={16} />
                <span>{post._count.comments}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}