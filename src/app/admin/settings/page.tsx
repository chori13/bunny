"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import SettingsForm from "./_components/SettingsForm";

export default function AdminSettingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch settings
  useEffect(() => {
    if (authStatus !== "authenticated" || session?.user?.role !== "ADMIN") return;

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("설정을 불러올 수 없습니다.");
        setSettings(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [authStatus, session]);

  const handleSave = async (data: Record<string, unknown>): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const { settings: updated } = await res.json();
        setSettings(updated);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-2">오류 발생</p>
          <p className="text-xs text-white/40">{error}</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
          <Settings size={12} />
          Site Settings
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">사이트 설정</h1>
        <p className="text-white/40 text-sm">
          사이트 기본 정보와 운영 설정을 관리합니다
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm initial={settings} onSave={handleSave} />
    </div>
  );
}
