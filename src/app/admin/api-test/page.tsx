"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
} from "lucide-react";

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  label: string;
  group: string;
  body?: string;
  needsId?: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // 상품
  { method: "GET", path: "/api/products", label: "상품 목록", group: "상품" },
  { method: "POST", path: "/api/products", label: "상품 등록 (FormData)", group: "상품" },
  { method: "GET", path: "/api/products/{id}", label: "상품 상세", group: "상품", needsId: "상품 ID" },
  { method: "DELETE", path: "/api/products/{id}", label: "상품 삭제", group: "상품", needsId: "상품 ID" },
  // 이벤트
  { method: "GET", path: "/api/events", label: "이벤트 목록", group: "이벤트" },
  { method: "POST", path: "/api/events", label: "이벤트 등록", group: "이벤트", body: JSON.stringify({ title: "테스트 이벤트", desc: "설명", period: "2026.03.15~03.31", icon: "🎉", color: "violet", status: "ACTIVE" }, null, 2) },
  { method: "GET", path: "/api/events/{id}", label: "이벤트 상세", group: "이벤트", needsId: "이벤트 ID" },
  { method: "DELETE", path: "/api/events/{id}", label: "이벤트 삭제", group: "이벤트", needsId: "이벤트 ID" },
  // 커뮤니티
  { method: "GET", path: "/api/community", label: "게시글 목록", group: "커뮤니티" },
  { method: "POST", path: "/api/community", label: "게시글 작성", group: "커뮤니티", body: JSON.stringify({ title: "테스트 글", content: "테스트 내용입니다." }, null, 2) },
  { method: "GET", path: "/api/community/{id}", label: "게시글 상세", group: "커뮤니티", needsId: "게시글 ID" },
  { method: "DELETE", path: "/api/community/{id}", label: "게시글 삭제", group: "커뮤니티", needsId: "게시글 ID" },
  { method: "POST", path: "/api/community/{id}/comments", label: "댓글 작성", group: "커뮤니티", needsId: "게시글 ID", body: JSON.stringify({ content: "테스트 댓글" }, null, 2) },
  // 주문
  { method: "GET", path: "/api/orders", label: "내 주문 목록", group: "주문" },
  // 결제
  { method: "POST", path: "/api/payments", label: "결제 검증", group: "결제", body: JSON.stringify({ paymentId: "test_123", orderId: "ORDER_ID" }, null, 2) },
  // 찜하기
  { method: "GET", path: "/api/wishlist?productId=PRODUCT_ID", label: "찜 여부 확인", group: "찜하기" },
  { method: "POST", path: "/api/wishlist", label: "찜 토글", group: "찜하기", body: JSON.stringify({ productId: "PRODUCT_ID" }, null, 2) },
  // 관리자
  { method: "GET", path: "/api/admin/stats", label: "관리자 통계", group: "관리자" },
  // 인증
  { method: "POST", path: "/api/auth/signup", label: "회원가입", group: "인증", body: JSON.stringify({ name: "testuser", password: "test1234" }, null, 2) },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-blue-500/15 text-blue-400",
  PUT: "bg-amber-500/15 text-amber-400",
  DELETE: "bg-red-500/15 text-red-400",
};

interface TestResult {
  status: number;
  time: number;
  data: string;
  ok: boolean;
}

export default function ApiTestPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const [idInputs, setIdInputs] = useState<Record<string, string>>({});
  const [bodyInputs, setBodyInputs] = useState<Record<string, string>>({});
  const [runningAll, setRunningAll] = useState(false);

  useEffect(() => {
    if (sessionStatus !== "loading" && (!session || session.user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [session, sessionStatus, router]);

  // 모든 그룹 기본 열림
  useEffect(() => {
    const groups: Record<string, boolean> = {};
    API_ENDPOINTS.forEach((e) => { groups[e.group] = true; });
    setExpandedGroups(groups);
  }, []);

  const getKey = (endpoint: ApiEndpoint) => `${endpoint.method}:${endpoint.path}:${endpoint.label}`;

  const runTest = async (endpoint: ApiEndpoint) => {
    const key = getKey(endpoint);
    setLoading((prev) => ({ ...prev, [key]: true }));

    let path = endpoint.path;
    if (endpoint.needsId) {
      const id = idInputs[key] || "";
      if (!id) {
        setResults((prev) => ({
          ...prev,
          [key]: { status: 0, time: 0, data: `"${endpoint.needsId}"를 입력해주세요.`, ok: false },
        }));
        setLoading((prev) => ({ ...prev, [key]: false }));
        return;
      }
      path = path.replace("{id}", id);
    }

    const start = performance.now();

    try {
      const options: RequestInit = { method: endpoint.method };

      if (endpoint.body && (endpoint.method === "POST" || endpoint.method === "PUT")) {
        const body = bodyInputs[key] || endpoint.body;
        options.headers = { "Content-Type": "application/json" };
        options.body = body;
      }

      const res = await fetch(path, options);
      const time = Math.round(performance.now() - start);

      let data: string;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        data = JSON.stringify(json, null, 2);
      } else {
        const text = await res.text();
        data = text.slice(0, 500);
      }

      setResults((prev) => ({
        ...prev,
        [key]: { status: res.status, time, data, ok: res.ok },
      }));
      setExpandedResults((prev) => ({ ...prev, [key]: true }));
    } catch (err) {
      const time = Math.round(performance.now() - start);
      setResults((prev) => ({
        ...prev,
        [key]: { status: 0, time, data: err instanceof Error ? err.message : "네트워크 오류", ok: false },
      }));
    }

    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  const runAllGetTests = async () => {
    setRunningAll(true);
    const getEndpoints = API_ENDPOINTS.filter((e) => e.method === "GET" && !e.needsId);
    for (const endpoint of getEndpoints) {
      await runTest(endpoint);
    }
    setRunningAll(false);
  };

  const groups = [...new Set(API_ENDPOINTS.map((e) => e.group))];

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* 헤더 */}
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white/70"
      >
        <ArrowLeft size={16} />
        대시보드로
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">API 테스트</h1>
          <p className="mt-2 text-sm text-white/40">
            모든 API 엔드포인트를 테스트할 수 있습니다
          </p>
        </div>
        <button
          onClick={runAllGetTests}
          disabled={runningAll}
          className="btn-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Play size={14} />
          {runningAll ? "테스트 중..." : "전체 GET 테스트"}
        </button>
      </div>

      {/* API 그룹별 목록 */}
      <div className="space-y-4">
        {groups.map((group) => {
          const endpoints = API_ENDPOINTS.filter((e) => e.group === group);
          const isExpanded = expandedGroups[group] ?? true;

          return (
            <div key={group} className="glass overflow-hidden rounded-2xl">
              <button
                onClick={() =>
                  setExpandedGroups((prev) => ({ ...prev, [group]: !isExpanded }))
                }
                className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-white/30" />
                  ) : (
                    <ChevronRight size={16} className="text-white/30" />
                  )}
                  <span className="text-sm font-semibold text-white">{group}</span>
                  <span className="text-xs text-white/30">{endpoints.length}개</span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/5">
                  {endpoints.map((endpoint) => {
                    const key = getKey(endpoint);
                    const result = results[key];
                    const isLoading = loading[key];
                    const isResultExpanded = expandedResults[key];

                    return (
                      <div key={key} className="border-b border-white/5 last:border-b-0">
                        <div className="flex items-center gap-3 px-6 py-3">
                          {/* 메서드 뱃지 */}
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${METHOD_COLORS[endpoint.method]}`}
                          >
                            {endpoint.method}
                          </span>

                          {/* 경로 + 라벨 */}
                          <div className="flex-1 min-w-0">
                            <code className="text-xs text-white/50">{endpoint.path}</code>
                            <p className="text-sm text-white/70">{endpoint.label}</p>
                          </div>

                          {/* 결과 상태 */}
                          {result && (
                            <div className="flex items-center gap-2 shrink-0">
                              {result.ok ? (
                                <CheckCircle size={14} className="text-emerald-400" />
                              ) : (
                                <XCircle size={14} className="text-red-400" />
                              )}
                              <span className={`text-xs font-mono ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
                                {result.status}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-white/30">
                                <Clock size={10} />
                                {result.time}ms
                              </span>
                            </div>
                          )}

                          {/* 실행 버튼 */}
                          <button
                            onClick={() => runTest(endpoint)}
                            disabled={isLoading}
                            className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
                          >
                            {isLoading ? (
                              <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                            ) : (
                              <Play size={12} />
                            )}
                            실행
                          </button>
                        </div>

                        {/* ID 입력 */}
                        {endpoint.needsId && (
                          <div className="px-6 pb-2">
                            <input
                              type="text"
                              value={idInputs[key] || ""}
                              onChange={(e) =>
                                setIdInputs((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              placeholder={endpoint.needsId}
                              className="input-dark w-full rounded-lg px-3 py-1.5 text-xs"
                            />
                          </div>
                        )}

                        {/* Body 입력 */}
                        {endpoint.body && (
                          <div className="px-6 pb-2">
                            <textarea
                              value={bodyInputs[key] ?? endpoint.body}
                              onChange={(e) =>
                                setBodyInputs((prev) => ({ ...prev, [key]: e.target.value }))
                              }
                              rows={3}
                              className="input-dark w-full resize-none rounded-lg px-3 py-2 font-mono text-xs"
                            />
                          </div>
                        )}

                        {/* 결과 영역 */}
                        {result && isResultExpanded && (
                          <div className="relative mx-6 mb-3 rounded-lg bg-black/30 p-3">
                            <button
                              onClick={() => navigator.clipboard.writeText(result.data)}
                              className="absolute right-2 top-2 rounded p-1 text-white/20 transition hover:text-white/50"
                              title="복사"
                            >
                              <Copy size={12} />
                            </button>
                            <pre className="max-h-48 overflow-auto text-xs text-white/50 scrollbar-thin">
                              {result.data}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
