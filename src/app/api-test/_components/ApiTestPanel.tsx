"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Lock, Shield, Clock, Loader2, FileJson, History, Info, Copy, Check } from "lucide-react";
import { endpoints, type ApiEndpoint, type TestResult } from "./api-data";
import MethodBadge from "./MethodBadge";
import ResponseViewer from "./ResponseViewer";
import ConfirmModal from "./ConfirmModal";

interface ApiTestPanelProps {
  endpointId: string;
  results: TestResult[];
  onTest: (endpointId: string, resolvedPath: string, body?: Record<string, unknown>) => void;
  isTesting: boolean;
}

type Tab = "request" | "response" | "history";

export default function ApiTestPanel({ endpointId, results, onTest, isTesting }: ApiTestPanelProps) {
  const endpoint = endpoints.find((e) => e.id === endpointId);
  if (!endpoint) return null;

  return <ApiTestPanelInner endpoint={endpoint} results={results} onTest={onTest} isTesting={isTesting} />;
}

function ApiTestPanelInner({
  endpoint,
  results,
  onTest,
  isTesting,
}: {
  endpoint: ApiEndpoint;
  results: TestResult[];
  onTest: (endpointId: string, resolvedPath: string, body?: Record<string, unknown>) => void;
  isTesting: boolean;
}) {
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState(
    endpoint.sampleBody ? JSON.stringify(endpoint.sampleBody, null, 2) : ""
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("request");
  const [urlCopied, setUrlCopied] = useState(false);

  const latestResult = results[0] ?? null;
  const viewingResult = selectedHistoryIdx !== null ? results[selectedHistoryIdx] : latestResult;

  // Auto switch to response tab when result comes in
  useEffect(() => {
    if (latestResult && !isTesting) {
      setActiveTab("response");
    }
  }, [latestResult, isTesting]);

  // Build resolved path
  const resolvedPath = (() => {
    let p = endpoint.path;
    endpoint.pathParams?.forEach((param) => {
      const val = pathValues[param.name] || param.example || "";
      p = p.replace(`[${param.name}]`, val);
    });
    if (endpoint.queryParams) {
      const params = new URLSearchParams();
      endpoint.queryParams.forEach((param) => {
        const val = queryValues[param.name] || param.example || "";
        if (val) params.set(param.name, val);
      });
      const qs = params.toString();
      if (qs) p += `?${qs}`;
    }
    return p;
  })();

  const handleSend = useCallback(() => {
    if (endpoint.isDestructive) {
      setShowConfirm(true);
      return;
    }
    executeTest();
  }, [endpoint, resolvedPath, bodyText]);

  const executeTest = () => {
    setShowConfirm(false);
    setSelectedHistoryIdx(null);
    let body: Record<string, unknown> | undefined;
    if (bodyText.trim() && endpoint.contentType !== "none") {
      try {
        body = JSON.parse(bodyText);
      } catch {
        body = undefined;
      }
    }
    onTest(endpoint.id, resolvedPath, body);
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSend]);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(window.location.origin + resolvedPath);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const hasParams = !!(endpoint.pathParams?.length || endpoint.queryParams?.length || (endpoint.contentType !== "none" && endpoint.bodyParams));

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "request", label: "요청", icon: <FileJson size={12} />, badge: hasParams ? `${(endpoint.pathParams?.length || 0) + (endpoint.queryParams?.length || 0) + (endpoint.bodyParams?.length || 0)}` : undefined },
    { id: "response", label: "응답", icon: <Info size={12} />, badge: viewingResult ? `${viewingResult.status}` : undefined },
    { id: "history", label: "기록", icon: <History size={12} />, badge: results.length > 0 ? `${results.length}` : undefined },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <MethodBadge method={endpoint.method} />
          <h3 className="text-sm font-semibold text-white flex-1">{endpoint.name}</h3>
          {/* Auth badges */}
          <div className="flex items-center gap-1.5">
            {endpoint.requiresAuth && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lock size={9} />
                인증
              </span>
            )}
            {endpoint.requiresAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                <Shield size={9} />
                관리자
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-white/40 mb-3">{endpoint.description}</p>

        {/* URL Bar */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
          <code className="text-xs text-white/60 flex-1 truncate">{resolvedPath}</code>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-1 rounded text-white/20 hover:text-white/50 transition-colors"
            title="URL 복사"
          >
            {urlCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-violet-400"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span
                className={`ml-1 px-1.5 py-0 rounded-full text-[9px] font-bold ${
                  activeTab === tab.id
                    ? "bg-violet-500/20 text-violet-400"
                    : "bg-white/5 text-white/25"
                }`}
              >
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Request Tab */}
        {activeTab === "request" && (
          <div className="space-y-4">
            {/* Path Params */}
            {endpoint.pathParams && endpoint.pathParams.length > 0 && (
              <ParamSection title="Path Parameters">
                {endpoint.pathParams.map((param) => (
                  <ParamInput
                    key={param.name}
                    name={param.name}
                    description={param.description}
                    required={param.required}
                    value={pathValues[param.name] || ""}
                    onChange={(v) => setPathValues((prev) => ({ ...prev, [param.name]: v }))}
                  />
                ))}
              </ParamSection>
            )}

            {/* Query Params */}
            {endpoint.queryParams && endpoint.queryParams.length > 0 && (
              <ParamSection title="Query Parameters">
                {endpoint.queryParams.map((param) => (
                  <ParamInput
                    key={param.name}
                    name={param.name}
                    description={param.description}
                    required={param.required}
                    value={queryValues[param.name] || ""}
                    onChange={(v) => setQueryValues((prev) => ({ ...prev, [param.name]: v }))}
                  />
                ))}
              </ParamSection>
            )}

            {/* Request Body */}
            {endpoint.contentType !== "none" && endpoint.bodyParams && (
              <ParamSection title={`Request Body (${endpoint.contentType === "multipart" ? "Form Data" : "JSON"})`}>
                {/* Body param hints */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {endpoint.bodyParams.map((p) => (
                    <span
                      key={p.name}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] ${
                        p.required
                          ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                          : "bg-white/5 text-white/30 border border-white/5"
                      }`}
                    >
                      {p.name}
                      {p.required && <span className="text-red-400 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs font-mono text-white/70 placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors resize-y"
                  placeholder='{ "key": "value" }'
                />
              </ParamSection>
            )}

            {!hasParams && (
              <div className="text-center py-6">
                <p className="text-xs text-white/20">이 엔드포인트는 파라미터가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* Response Tab */}
        {activeTab === "response" && (
          <div className="space-y-3">
            {viewingResult ? (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={viewingResult.status} />
                  <span className="text-xs text-white/30">{viewingResult.statusText}</span>
                  <div className="flex items-center gap-1 text-xs text-white/30">
                    <Clock size={10} />
                    <span className={viewingResult.responseTime > 500 ? "text-amber-400" : viewingResult.responseTime > 1000 ? "text-red-400" : ""}>
                      {viewingResult.responseTime}ms
                    </span>
                  </div>
                  <span className="text-[10px] text-white/15">
                    {viewingResult.timestamp.toLocaleTimeString("ko-KR")}
                  </span>
                </div>
                <ResponseViewer body={viewingResult.responseBody} />
              </>
            ) : (
              <div className="text-center py-12">
                <Send size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">테스트를 실행하면 응답이 여기에 표시됩니다</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-12">
                <History size={24} className="text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">테스트 기록이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedHistoryIdx(i);
                      setActiveTab("response");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs hover:bg-white/5 transition-colors border ${
                      selectedHistoryIdx === i ? "border-violet-500/30 bg-violet-500/5" : "border-transparent"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${r.success ? "bg-emerald-400" : "bg-red-400"}`} />
                    <StatusBadge status={r.status} />
                    <span className="text-white/30 flex-1 text-left">{r.statusText}</span>
                    <span className={`flex-shrink-0 ${r.responseTime > 500 ? "text-amber-400/60" : "text-white/20"}`}>
                      {r.responseTime}ms
                    </span>
                    <span className="text-white/15 flex-shrink-0">
                      {r.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <button
            onClick={handleSend}
            disabled={isTesting}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                테스트 중...
              </>
            ) : (
              <>
                <Send size={14} />
                테스트 실행
                <span className="text-white/40 text-xs ml-1">(Ctrl+Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <ConfirmModal
          method={endpoint.method}
          path={resolvedPath}
          onConfirm={executeTest}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}

function ParamSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-white/50 font-medium flex items-center gap-2">
        {title}
      </label>
      {children}
    </div>
  );
}

function ParamInput({
  name,
  description,
  required,
  value,
  onChange,
}: {
  name: string;
  description: string;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 min-w-[80px]">
        <span className="text-xs text-violet-400">{name}</span>
        {required && <span className="text-red-400 text-[10px]">*</span>}
      </div>
      <input
        type="text"
        placeholder={description}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const color =
    status >= 200 && status < 300
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : status >= 400 && status < 500
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-red-500/20 text-red-400 border-red-500/30";

  return (
    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>
      {status}
    </span>
  );
}