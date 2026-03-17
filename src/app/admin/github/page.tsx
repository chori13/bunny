"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Github,
  GitCommit,
  GitPullRequest,
  CircleDot,
  GitBranch,
  Play,
  Users,
  Star,
  Eye,
  GitFork,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  FileCode,
  MessageSquare,
  Tag,
} from "lucide-react";

/* ─── Types ─── */
interface Repo {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  pushed_at: string;
  created_at: string;
  visibility: string;
  size: number;
}

interface Commit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
}

interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  comments: number;
  created_at: string;
  updated_at: string;
  pull_request?: unknown;
}

interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  labels: { name: string; color: string }[];
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  head: { ref: string };
  base: { ref: string };
}

interface Branch {
  name: string;
  protected: boolean;
  commit: { sha: string };
}

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  head_branch: string;
  head_sha: string;
  created_at: string;
  updated_at: string;
  run_number: number;
  actor: { login: string; avatar_url: string };
}

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

type TabType = "overview" | "commits" | "issues" | "pulls" | "branches" | "actions" | "contributors";

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

function stateColor(state: string, merged?: boolean) {
  if (merged) return "bg-violet-500/15 text-violet-400 border-violet-500/20";
  switch (state) {
    case "open":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "closed":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "bg-white/10 text-white/60 border-white/10";
  }
}

function conclusionStyle(conclusion: string | null, status: string) {
  if (status === "in_progress") return { color: "text-amber-400", bg: "bg-amber-500/15", icon: Play };
  switch (conclusion) {
    case "success":
      return { color: "text-emerald-400", bg: "bg-emerald-500/15", icon: CheckCircle2 };
    case "failure":
      return { color: "text-red-400", bg: "bg-red-500/15", icon: XCircle };
    case "cancelled":
      return { color: "text-white/40", bg: "bg-white/5", icon: XCircle };
    default:
      return { color: "text-amber-400", bg: "bg-amber-500/15", icon: AlertCircle };
  }
}

function langColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Python: "#3572A5",
    Go: "#00ADD8",
    Rust: "#dea584",
    Java: "#b07219",
  };
  return colors[lang] || "#8b949e";
}

/* ─── Main Component ─── */
export default function AdminGitHubPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<TabType>("overview");
  const [repo, setRepo] = useState<Repo | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [commits, setCommits] = useState<Commit[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pulls, setPulls] = useState<PullRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [actions, setActions] = useState<WorkflowRun[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [issueState, setIssueState] = useState("all");
  const [pullState, setPullState] = useState("all");

  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") router.push("/");
  }, [session, authStatus, router]);

  const fetchData = useCallback(
    async (currentTab?: TabType) => {
      const t = currentTab || tab;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type: t === "overview" ? "repo" : t });
        if (t === "issues") params.set("state", issueState);
        if (t === "pulls") params.set("state", pullState);

        const res = await fetch(`/api/admin/github?${params}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error);
          return;
        }

        switch (t) {
          case "overview":
            setRepo(data.repo);
            setLanguages(data.languages || {});
            break;
          case "commits":
            setCommits(data.commits || []);
            break;
          case "issues":
            setIssues((data.issues || []).filter((i: Issue) => !i.pull_request));
            break;
          case "pulls":
            setPulls(data.pulls || []);
            break;
          case "branches":
            setBranches(data.branches || []);
            break;
          case "actions":
            setActions(data.runs || []);
            break;
          case "contributors":
            setContributors(data.contributors || []);
            break;
        }
      } catch {
        setError("GitHub API 연결에 실패했습니다.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tab, issueState, pullState]
  );

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchData();
    }
  }, [fetchData, authStatus, session]);

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    fetchData(newTab);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Github }[] = [
    { key: "overview", label: "개요", icon: Github },
    { key: "commits", label: "커밋", icon: GitCommit },
    { key: "issues", label: "이슈", icon: CircleDot },
    { key: "pulls", label: "PR", icon: GitPullRequest },
    { key: "branches", label: "브랜치", icon: GitBranch },
    { key: "actions", label: "Actions", icon: Play },
    { key: "contributors", label: "기여자", icon: Users },
  ];

  const totalLangBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs mb-4">
            <Github size={12} />
            Repository Management
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">GitHub 관리</h1>
          <p className="text-white/40 text-sm">
            커밋, 이슈, PR, 브랜치, Actions 현황을 한눈에 확인
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
      <div className="mb-6 flex gap-1 rounded-2xl border border-white/5 bg-white/[0.02] p-1.5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition whitespace-nowrap ${
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

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400 mb-1">연결 오류</p>
              <p className="text-sm text-white/50">{error}</p>
              <code className="mt-2 block text-xs text-white/40 bg-black/30 rounded-lg p-3">
                GITHUB_TOKEN=&quot;your-github-pat&quot;{"\n"}
                GITHUB_OWNER=&quot;chori13&quot;{"\n"}
                GITHUB_REPO=&quot;bunny&quot;
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
            <p className="text-sm text-white/40">GitHub 데이터를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* ─── Overview Tab ─── */}
      {!loading && !error && tab === "overview" && repo && (
        <div className="space-y-6">
          {/* Repo Info Card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Github size={24} className="text-white" />
                  <h2 className="text-xl font-bold text-white">{repo.full_name}</h2>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white/40">
                    {repo.visibility}
                  </span>
                </div>
                {repo.description && (
                  <p className="text-sm text-white/40">{repo.description}</p>
                )}
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 hover:text-white transition"
              >
                <ExternalLink size={12} />
                GitHub에서 보기
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Star, label: "Stars", value: repo.stargazers_count, color: "text-amber-400" },
                { icon: Eye, label: "Watchers", value: repo.watchers_count, color: "text-blue-400" },
                { icon: GitFork, label: "Forks", value: repo.forks_count, color: "text-cyan-400" },
                { icon: CircleDot, label: "Open Issues", value: repo.open_issues_count, color: "text-emerald-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center">
                  <s.icon size={18} className={`mx-auto mb-2 ${s.color}`} />
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <GitBranch size={12} />
                기본 브랜치: <span className="text-white/60">{repo.default_branch}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                마지막 푸시: <span className="text-white/60">{timeAgo(repo.pushed_at)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FileCode size={12} />
                크기: <span className="text-white/60">{(repo.size / 1024).toFixed(1)} MB</span>
              </span>
            </div>
          </div>

          {/* Languages */}
          {totalLangBytes > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">사용 언어</h3>
              {/* Language bar */}
              <div className="flex h-3 rounded-full overflow-hidden mb-4">
                {Object.entries(languages).map(([lang, bytes]) => (
                  <div
                    key={lang}
                    style={{
                      width: `${(bytes / totalLangBytes) * 100}%`,
                      backgroundColor: langColor(lang),
                    }}
                    title={`${lang}: ${((bytes / totalLangBytes) * 100).toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {Object.entries(languages).map(([lang, bytes]) => (
                  <div key={lang} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: langColor(lang) }}
                    />
                    <span className="text-white/60">{lang}</span>
                    <span className="text-white/30">
                      {((bytes / totalLangBytes) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Commits Tab ─── */}
      {!loading && !error && tab === "commits" && (
        <div className="space-y-2">
          {commits.length === 0 ? (
            <EmptyState icon={GitCommit} text="커밋이 없습니다" />
          ) : (
            commits.map((c) => (
              <a
                key={c.sha}
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 group"
              >
                <div className="mt-0.5">
                  {c.author?.avatar_url ? (
                    <img src={c.author.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">
                      {c.commit.author.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate group-hover:text-violet-300 transition">
                    {c.commit.message.split("\n")[0]}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-white/30">
                    <span className="text-white/50">{c.author?.login || c.commit.author.name}</span>
                    <span>{timeAgo(c.commit.author.date)}</span>
                    <span className="font-mono text-white/20">{c.sha.slice(0, 7)}</span>
                  </div>
                </div>
                <ExternalLink size={14} className="text-white/0 group-hover:text-white/30 transition shrink-0 mt-1" />
              </a>
            ))
          )}
        </div>
      )}

      {/* ─── Issues Tab ─── */}
      {!loading && !error && tab === "issues" && (
        <div>
          <div className="mb-4 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit">
            {[
              { value: "all", label: "전체" },
              { value: "open", label: "열림" },
              { value: "closed", label: "닫힘" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setIssueState(f.value); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  issueState === f.value
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {issues.length === 0 ? (
              <EmptyState icon={CircleDot} text="이슈가 없습니다" />
            ) : (
              issues.map((issue) => (
                <a
                  key={issue.id}
                  href={issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 group"
                >
                  <CircleDot
                    size={18}
                    className={`mt-0.5 shrink-0 ${issue.state === "open" ? "text-emerald-400" : "text-red-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white truncate group-hover:text-violet-300 transition">
                        {issue.title}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {issue.labels.map((l) => (
                        <span
                          key={l.name}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium border"
                          style={{
                            backgroundColor: `#${l.color}20`,
                            borderColor: `#${l.color}40`,
                            color: `#${l.color}`,
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span>#{issue.number}</span>
                      <span>{issue.user.login}</span>
                      <span>{timeAgo(issue.created_at)}</span>
                      {issue.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare size={10} /> {issue.comments}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${stateColor(issue.state)}`}>
                    {issue.state === "open" ? "열림" : "닫힘"}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Pull Requests Tab ─── */}
      {!loading && !error && tab === "pulls" && (
        <div>
          <div className="mb-4 flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1 w-fit">
            {[
              { value: "all", label: "전체" },
              { value: "open", label: "열림" },
              { value: "closed", label: "닫힘" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setPullState(f.value); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  pullState === f.value
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {pulls.length === 0 ? (
              <EmptyState icon={GitPullRequest} text="PR이 없습니다" />
            ) : (
              pulls.map((pr) => (
                <a
                  key={pr.id}
                  href={pr.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 group"
                >
                  <GitPullRequest
                    size={18}
                    className={`mt-0.5 shrink-0 ${
                      pr.merged_at ? "text-violet-400" : pr.state === "open" ? "text-emerald-400" : "text-red-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-violet-300 transition mb-1">
                      {pr.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {pr.labels.map((l) => (
                        <span
                          key={l.name}
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium border"
                          style={{
                            backgroundColor: `#${l.color}20`,
                            borderColor: `#${l.color}40`,
                            color: `#${l.color}`,
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span>#{pr.number}</span>
                      <span>{pr.user.login}</span>
                      <span className="font-mono">
                        {pr.head.ref} → {pr.base.ref}
                      </span>
                      <span>{timeAgo(pr.created_at)}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${stateColor(pr.state, !!pr.merged_at)}`}>
                    {pr.merged_at ? "병합됨" : pr.state === "open" ? "열림" : "닫힘"}
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── Branches Tab ─── */}
      {!loading && !error && tab === "branches" && (
        <div className="space-y-2">
          {branches.length === 0 ? (
            <EmptyState icon={GitBranch} text="브랜치가 없습니다" />
          ) : (
            branches.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              >
                <GitBranch size={18} className="text-cyan-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium text-white">{b.name}</p>
                    {b.protected && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                        protected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/25 font-mono mt-0.5">{b.commit.sha.slice(0, 7)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Actions Tab ─── */}
      {!loading && !error && tab === "actions" && (
        <div className="space-y-2">
          {actions.length === 0 ? (
            <EmptyState icon={Play} text="워크플로우 실행 기록이 없습니다" />
          ) : (
            actions.map((run) => {
              const style = conclusionStyle(run.conclusion, run.status);
              return (
                <a
                  key={run.id}
                  href={run.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10 group"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${style.bg}`}>
                    <style.icon size={18} className={style.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-violet-300 transition">
                      {run.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-white/30 mt-1">
                      <span>#{run.run_number}</span>
                      <span className="font-mono">{run.head_branch}</span>
                      <span>{run.actor.login}</span>
                      <span>{timeAgo(run.created_at)}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-medium ${style.color}`}>
                    {run.status === "in_progress"
                      ? "실행 중"
                      : run.conclusion === "success"
                      ? "성공"
                      : run.conclusion === "failure"
                      ? "실패"
                      : run.conclusion === "cancelled"
                      ? "취소"
                      : run.status}
                  </span>
                </a>
              );
            })
          )}
        </div>
      )}

      {/* ─── Contributors Tab ─── */}
      {!loading && !error && tab === "contributors" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contributors.length === 0 ? (
            <EmptyState icon={Users} text="기여자 정보가 없습니다" />
          ) : (
            contributors.map((c, i) => (
              <a
                key={c.login}
                href={c.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="relative">
                  <img src={c.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                  {i < 3 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{c.login}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    <span className="text-violet-400 font-bold">{c.contributions}</span> commits
                  </p>
                </div>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Empty State Component ─── */
function EmptyState({ icon: Icon, text }: { icon: typeof Github; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
        <Icon size={28} className="text-white/20" />
      </div>
      <p className="text-sm text-white/40">{text}</p>
    </div>
  );
}
