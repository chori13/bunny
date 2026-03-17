"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScrollText } from "lucide-react";
import AuditLogTable, { type AuditLogRow } from "./_components/AuditLogTable";

interface AuditLogsResponse {
  logs: AuditLogRow[];
  total: number;
  page: number;
  totalPages: number;
  actionCounts: Record<string, number>;
}

export default function AdminAuditLogsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [targetTypeFilter, setTargetTypeFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (targetTypeFilter) params.set("targetType", targetTypeFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("감사 로그 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, targetTypeFilter, search, page]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchLogs();
    }
  }, [fetchLogs, authStatus, session]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  if (authStatus === "loading" || (authStatus === "authenticated" && !data && loading)) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
          <ScrollText size={12} />
          Audit Log
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">감사 로그</h1>
        <p className="text-white/40 text-sm">
          관리자의 모든 활동 기록을 확인할 수 있습니다
        </p>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable
        logs={data?.logs || []}
        total={data?.total || 0}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        actionCounts={data?.actionCounts || {}}
        currentAction={actionFilter}
        currentTargetType={targetTypeFilter}
        search={searchInput}
        onActionFilter={(a) => {
          setActionFilter(a);
          setPage(1);
        }}
        onTargetTypeFilter={(t) => {
          setTargetTypeFilter(t);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
}
