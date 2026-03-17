"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bug,
  Activity,
  Rocket,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  Search,
  Filter,
  X,
} from "lucide-react";

/* ─── Types ─── */
interface SentryIssue {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  metadata: { type?: string; value?: string };
  project: { slug: string };
}

interface SentryEvent {
  eventID: string;
  id: string;
  title: string;
  message: string;
  dateCreated: string;
  context?: Record<string, unknown>;
  tags: { key: string; value: string }[];
  user?: { username?: string; email?: string; ip_address?: string };
}

interface SentryRelease {
  version: string;
  dateCreated: string;
  dateReleased: string | null;
  newGroups: number;
  commitCount: number;
  lastDeploy: { environment: string; dateFinished: string } | null;
  projects: { slug: string; newGroups: number }[];
}

interface IssueDetail {
  issue: SentryIssue & { annotations: string[]; assignedTo: unknown };
  events: SentryEvent[];
}

type TabType = "issues" | "events" | "releases" | "stats";

/* ─── Helpers ─── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

function levelColor(level: string) {
  switch (level) {
    case "error":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    case "warning":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "info":
      return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    case "fatal":
      return "bg-rose-500/15 text-rose-300 border-rose-500/20";
    default:
      return "bg-white/10 text-white/60 border-white/10";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "resolved":
      return <CheckCircle2 size={14} className="text-emerald-400" />;
    case "ignored":
      return <XCircle size={14} className="text-white/30" />;
    default:
      return <AlertTriangle size={14} className="text-amber-400" />;
  }
}

/* ─── Main Component ─── */
export default function AdminSentryPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("issues");
  const [issues, setIssues] = useState<SentryIssue[]>([]);
  const [events, setEvents] = useState<SentryEvent[]>([]);
  const [releases, setReleases] = useState<SentryRelease[]>([]);
  const [stats, setStats] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [issueQuery, setIssueQuery] = useState("is:unresolved");
  const [issueSort, setIssueSort] = useState("date");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch data
  const fetchData = useCallback(
    async (currentTab?: TabType) => {
      const t = currentTab || tab;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type: t });
        if (t === "issues") {
          params.set("query", issueQuery);
          params.set("sort", issueSort);
        }
        const res = await fetch(`/api/admin/sentry?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "데이터를 불러오는데 실패했습니다.");
          return;
        }

        switch (t) {
          case "issues":
            setIssues(data.issues || []);
            break;
          case "events":
            setEvents(data.events || []);
            break;
          case "releases":
            setReleases(data.releases || []);
            break;
          case "stats":
            setStats(data.stats || []);
            break;
        }
      } catch {
        setError("Sentry API 연결에 실패했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tab, issueQuery, issueSort]
  );

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [fetchData, authStatus, session]);

  // Debounced search for issues
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput) {
        setIssueQuery(`is:unresolved ${searchInput}`);
      } else {
        setIssueQuery("is:unresolved");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch issue detail
  const handleIssueClick = async (issueId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/sentry?type=issue-detail&issueId=${issueId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedIssue(data);
      }
    } catch {
      console.error("이슈 상세 로드 실패");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    fetchData(newTab);
  };

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Bug }[] = [
    { key: "issues", label: "에러 추적", icon: Bug },
    { key: "events", label: "이벤트", icon: Activity },
    { key: "releases", label: "릴리스", icon: Rocket },
    { key: "stats", label: "통계", icon: BarChart3 },
  ];

  /* ─── Stats Chart (simple bar chart) ─── */
  const maxStatValue = Math.max(...stats.map(([, v]) => v), 1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
            <Bug size={12} />
            Error Monitoring
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Sentry 모니터링</h1>
          <p className="text-white/40 text-sm">
            실시간 에러 추적, 이벤트 모니터링, 릴리스 관리
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          새로고침
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "bg-violet-500/15 text-violet-400"
                : "text-white/40 hover:bg-white/5 hover:text-white/70"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">연결 오류</p>
              <p className="text-sm text-white/50">{error}</p>
              <p className="mt-3 text-xs text-white/30">
                .env 파일에 아래 환경변수가 설정되어 있는지 확인하세요:
              </p>
              <code className="mt-1 block text-xs text-white/40 bg-black/30 rounded-lg p-3">
                SENTRY_AUTH_TOKEN=&quot;your-token&quot;{"\n"}
                SENTRY_ORG=&quot;chori13&quot;{"\n"}
                SENTRY_PROJECT=&quot;javascript-nextjs&quot;
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-4" />
            <p className="text-sm text-white/40">Sentry 데이터를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* ─── Issues Tab ─── */}
      {!loading && !error && tab === "issues" && (
        <div>
          {/* Filters */}
          <div className="mb-4 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="에러 검색..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-white/25 focus:border-violet-500/30 focus:outline-none"
              />
            </div>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              {[
                { value: "is:unresolved", label: "미해결" },
                { value: "is:resolved", label: "해결됨" },
                { value: "is:ignored", label: "무시" },
                { value: "", label: "전체" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setIssueQuery(f.value || "");
                    setSearchInput("");
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    issueQuery === f.value
                      ? "bg-violet-500/15 text-violet-400"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <select
              value={issueSort}
              onChange={(e) => setIssueSort(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 focus:outline-none"
            >
              <option value="date">최신순</option>
              <option value="freq">빈도순</option>
              <option value="new">처음 발견순</option>
              <option value="priority">우선순위</option>
            </select>
          </div>

          {/* Issues List */}
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">이슈 없음</p>
              <p className="text-sm text-white/40">현재 조건에 맞는 이슈가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueClick(issue.id)}
                  className="w-full text-left rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {statusIcon(issue.status)}
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${levelColor(issue.level)}`}>
                          {issue.level}
                        </span>
                        <span className="text-xs text-white/25">{issue.shortId}</span>
                      </div>
                      <p className="font-medium text-white truncate mb-1 group-hover:text-violet-300 transition">
                        {issue.title}
                      </p>
                      <p className="text-xs text-white/30 truncate">{issue.culprit}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{Number(issue.count).toLocaleString()}</p>
                        <p className="text-[10px] text-white/30">발생 횟수</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{issue.userCount}</p>
                        <p className="text-[10px] text-white/30">영향 사용자</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-white/50">{timeAgo(issue.lastSeen)}</p>
                        <p className="text-[10px] text-white/25">마지막 발생</p>
                      </div>
                      <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Events Tab ─── */}
      {!loading && !error && tab === "events" && (
        <div>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 mb-4">
                <Activity size={28} className="text-blue-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">이벤트 없음</p>
              <p className="text-sm text-white/40">최근 기록된 이벤트가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.eventID}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate mb-1">
                        {event.title || event.message || "(제목 없음)"}
                      </p>
                      {event.message && event.message !== event.title && (
                        <p className="text-xs text-white/30 truncate mb-2">{event.message}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags?.slice(0, 5).map((tag) => (
                          <span
                            key={`${tag.key}-${tag.value}`}
                            className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px]"
                          >
                            <span className="text-white/30">{tag.key}:</span>
                            <span className="text-white/60">{tag.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-white/40">
                        <Clock size={12} />
                        {timeAgo(event.dateCreated)}
                      </div>
                      {event.user && (
                        <p className="text-[10px] text-white/25 mt-1">
                          {event.user.email || event.user.username || event.user.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Releases Tab ─── */}
      {!loading && !error && tab === "releases" && (
        <div>
          {releases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 mb-4">
                <Rocket size={28} className="text-cyan-400" />
              </div>
              <p className="text-lg font-medium text-white mb-1">릴리스 없음</p>
              <p className="text-sm text-white/40">등록된 릴리스가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {releases.map((release) => (
                <div
                  key={release.version}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Rocket size={16} className="text-cyan-400 shrink-0" />
                        <p className="font-mono text-sm font-medium text-white truncate">
                          {release.version}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {timeAgo(release.dateCreated)}
                        </span>
                        {release.commitCount > 0 && (
                          <span>{release.commitCount}개 커밋</span>
                        )}
                        {release.newGroups > 0 && (
                          <span className="text-amber-400">
                            새 이슈 {release.newGroups}개
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {release.lastDeploy && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase">
                          {release.lastDeploy.environment}
                        </span>
                      )}
                      {release.dateReleased && (
                        <p className="text-[10px] text-white/25 mt-1">
                          배포: {new Date(release.dateReleased).toLocaleDateString("ko-KR")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Stats Tab ─── */}
      {!loading && !error && tab === "stats" && (
        <div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">일별 이벤트 수신량</h3>
                <p className="text-xs text-white/30 mt-1">최근 30일간의 에러 이벤트 추이</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {stats.reduce((sum, [, v]) => sum + v, 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-white/30">총 이벤트</p>
              </div>
            </div>

            {stats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 size={28} className="text-white/20 mb-3" />
                <p className="text-sm text-white/40">통계 데이터가 없습니다</p>
              </div>
            ) : (
              <div className="flex items-end gap-1 h-48">
                {stats.map(([timestamp, value], i) => {
                  const date = new Date(timestamp * 1000);
                  const height = maxStatValue > 0 ? (value / maxStatValue) * 100 : 0;
                  return (
                    <div
                      key={timestamp}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <span className="text-[10px] text-white/0 group-hover:text-white/60 transition font-mono">
                        {value}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-violet-500/30 group-hover:bg-violet-500/60 transition min-h-[2px]"
                        style={{ height: `${Math.max(height, 1)}%` }}
                      />
                      {i % 5 === 0 && (
                        <span className="text-[8px] text-white/20 mt-1">
                          {date.getMonth() + 1}/{date.getDate()}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Issue Detail Modal ─── */}
      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {selectedIssue && !detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#16161a] p-6">
            {/* Close */}
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 rounded-lg p-2 text-white/30 hover:bg-white/5 hover:text-white transition"
            >
              <X size={18} />
            </button>

            {/* Issue Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {statusIcon(selectedIssue.issue.status)}
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${levelColor(selectedIssue.issue.level)}`}>
                  {selectedIssue.issue.level}
                </span>
                <span className="text-xs text-white/25">{selectedIssue.issue.shortId}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {selectedIssue.issue.title}
              </h2>
              <p className="text-sm text-white/40">{selectedIssue.issue.culprit}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "발생 횟수", value: Number(selectedIssue.issue.count).toLocaleString(), color: "text-violet-400" },
                { label: "영향 사용자", value: String(selectedIssue.issue.userCount), color: "text-cyan-400" },
                { label: "처음 발생", value: timeAgo(selectedIssue.issue.firstSeen), color: "text-amber-400" },
                { label: "마지막 발생", value: timeAgo(selectedIssue.issue.lastSeen), color: "text-emerald-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Error Type/Value */}
            {selectedIssue.issue.metadata?.type && (
              <div className="mb-6 rounded-xl border border-white/5 bg-black/30 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2">에러 정보</p>
                <p className="text-sm font-mono text-red-400 mb-1">
                  {selectedIssue.issue.metadata.type}
                </p>
                {selectedIssue.issue.metadata.value && (
                  <p className="text-xs font-mono text-white/50 break-all">
                    {selectedIssue.issue.metadata.value}
                  </p>
                )}
              </div>
            )}

            {/* Recent Events */}
            {selectedIssue.events.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-3">
                  최근 이벤트
                </p>
                <div className="space-y-2">
                  {selectedIssue.events.map((event) => (
                    <div
                      key={event.eventID}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-white/30" />
                          <span className="text-xs font-mono text-white/50">
                            {event.eventID.slice(0, 12)}...
                          </span>
                        </div>
                        <span className="text-xs text-white/30">
                          {timeAgo(event.dateCreated)}
                        </span>
                      </div>
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.tags.slice(0, 6).map((tag) => (
                            <span
                              key={`${tag.key}-${tag.value}`}
                              className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-[9px]"
                            >
                              <span className="text-white/25">{tag.key}:</span>
                              <span className="text-white/50">{tag.value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
