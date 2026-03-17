"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 경우 역할에 따라 이동
  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.replace(session.user?.role === "ADMIN" ? "/admin" : "/products");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      name,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      alert("아이디 또는 비밀번호가 잘못되었습니다.");
    } else {
      // 세션에서 role 확인 후 분기
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const isAdmin = session?.user?.role === "ADMIN";
      router.push(isAdmin ? "/admin" : "/products");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold gradient-text">로그인</h1>
          <p className="mt-2 text-sm text-white/40">계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/70">
              아이디
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input-dark w-full rounded-xl px-4 py-3"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-dark w-full rounded-xl px-4 py-3"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-violet-400 transition hover:text-violet-300">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}