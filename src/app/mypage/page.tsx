"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">My 페이지</h1>

        <div className="rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <span className="text-sm text-gray-500">아이디</span>
            <p className="text-lg font-medium">{session.user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-medium text-white hover:bg-orange-600"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
