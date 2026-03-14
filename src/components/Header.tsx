"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart";

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-orange-500">
          🐰 Bunny Shop
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/products" className="text-gray-600 hover:text-gray-900">
            전체 상품
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-gray-600 hover:text-gray-900"
          >
            🛒 장바구니
            {totalItems() > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                {totalItems()}
              </span>
            )}
          </Link>

          {status === "loading" ? (
            <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-200" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                {session.user?.name}님
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
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
