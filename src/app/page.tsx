"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
    } else if (session.user?.role === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace("/products");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-[85vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}