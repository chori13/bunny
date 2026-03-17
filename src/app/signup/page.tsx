"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      name,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      alert("로그인에 실패했습니다.");
    } else {
      router.push("/mypage");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold gradient-text">회원가입</h1>
          <p className="mt-2 text-sm text-white/40">새 계정을 만들어보세요</p>
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
              placeholder="6자 이상 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-violet-400 transition hover:text-violet-300">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
