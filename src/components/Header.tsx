"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Rabbit } from "lucide-react";

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const loadFromServer = useCartStore((s) => s.loadFromServer);
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [badgeBounce, setBadgeBounce] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevCount = useRef(0);
  const syncedRef = useRef(false);

  // 클라이언트 마운트 후에만 장바구니 뱃지 표시 (hydration mismatch 방지)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인 시 서버 장바구니 동기화
  useEffect(() => {
    if (session?.user?.id && !syncedRef.current) {
      syncedRef.current = true;
      loadFromServer();
    }
    if (!session) {
      syncedRef.current = false;
    }
  }, [session, loadFromServer]);

  // 스크롤 시 헤더 배경 변화
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // 장바구니 뱃지 바운스
  useEffect(() => {
    const count = totalItems();
    if (count !== prevCount.current && count > 0) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 400);
      prevCount.current = count;
      return () => clearTimeout(timer);
    }
    prevCount.current = count;
  }, [totalItems]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg shadow-black/20"
          : "bg-transparent border-b border-white/5"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold gradient-text tracking-tight inline-flex items-center gap-2">
          <Rabbit className="h-5 w-5 text-violet-400" />
          Bunny Shop
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/products" className="nav-link text-sm text-white/60 transition hover:text-white">
            전체 상품
          </Link>
          <Link href="/events" className="nav-link text-sm text-white/60 transition hover:text-white">
            이벤트
          </Link>
          <Link href="/community" className="nav-link text-sm text-white/60 transition hover:text-white">
            커뮤니티
          </Link>
          <Link href="/guide" className="nav-link text-sm text-white/60 transition hover:text-white">
            건강 가이드
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-xl px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white inline-flex items-center gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" />
            장바구니
            {mounted && totalItems() > 0 && (
              <span
                className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white ${
                  badgeBounce ? "animate-badge-bounce" : ""
                }`}
              >
                {totalItems()}
              </span>
            )}
          </Link>

          {status === "loading" ? (
            <div className="h-8 w-16 animate-pulse rounded-lg bg-white/5" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                마이페이지
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="btn-gradient rounded-lg px-4 py-1.5 text-sm font-medium text-white"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
