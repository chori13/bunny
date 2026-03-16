"use client";

import { Activity, Play, CheckCircle2, XCircle, Clock, Loader2, Trash2 } from "lucide-react";
import { endpoints, type TestResult, type HttpMethod } from "./api-data";

interface ApiTestSummaryProps {
  testResults: Map<string, TestResult[]>;
  isBatchTesting: boolean;
  batchProgress: { completed: number; total: number };
  onTestAll: () => void;
  onClearResults: () => void;
}

const methodColors: Record<HttpMethod, string> = {
  GET: "bg-emerald-500",
  POST: "bg-blue-500",
  PUT: "bg-amber-500",
  DELETE: "bg-red-500",
};

export default function ApiTestSummary({
  testResults,
  isBatchTesting,
  batchProgress,
  onTestAll,
  onClearResults,
}: ApiTestSummaryProps) {
  const totalEndpoints = endpoints.length;
  const testedCount = testResults.size;

  let passedCount = 0;
  let failedCount = 0;
  let totalTime = 0;
  let timeCount = 0;

  testResults.forEach((results) => {
    if (results.length > 0) {
      const latest = results[0];
      if (latest.success) passedCount++;
      else failedCount++;
      totalTime += latest.responseTime;
      timeCount++;
    }
  });

  const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;
  const successRate = testedCount > 0 ? Math.round((passedCount / testedCount) * 100) : 0;

  // Method distribution
  const methodCounts = endpoints.reduce(
    (acc, ep) => {
      acc[ep.method] = (acc[ep.method] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 mb-6">
      <div className="flex flex-wrap items-start gap-6">
        {/* Left: Stats Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <StatCard
              icon={<Activity size={14} />}
              label="전체 API"
              value={totalEndpoints}
              color="text-white/60"
              bgColor="bg-white/5"
            />
            <StatCard
              icon={<CheckCircle2 size={14} />}
              label="통과"
              value={passedCount}
              color="text-emerald-400"
              bgColor="bg-emerald-500/5"
            />
            <StatCard
              icon={<XCircle size={14} />}
              label="실패"
              value={failedCount}
              color="text-red-400"
              bgColor="bg-red-500/5"
            />
            <StatCard
              icon={<Clock size={14} />}
              label="평균 응답"
              value={timeCount > 0 ? `${avgTime}ms` : "-"}
              color="text-amber-400"
              bgColor="bg-amber-500/5"
            />
          </div>

          {/* Progress bar + method distribution */}
          <div className="flex items-center gap-4">
            {/* Success rate bar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/30">
                  테스트 진행률 {testedCount}/{totalEndpoints}
                </span>
                {testedCount > 0 && (
                  <span className="text-[10px] text-white/40">
                    성공률 <span className={successRate >= 80 ? "text-emerald-400" : successRate >= 50 ? "text-amber-400" : "text-red-400"}>{successRate}%</span>
                  </span>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                {passedCount > 0 && (
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(passedCount / totalEndpoints) * 100}%` }}
                  />
                )}
                {failedCount > 0 && (
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(failedCount / totalEndpoints) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Method distribution */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {(["GET", "POST", "PUT", "DELETE"] as HttpMethod[]).map((method) => (
                <div key={method} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-sm ${methodColors[method]}`} />
                  <span className="text-[10px] text-white/30">{methodCounts[method] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={onTestAll}
            disabled={isBatchTesting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBatchTesting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {batchProgress.completed}/{batchProgress.total}
              </>
            ) : (
              <>
                <Play size={14} />
                전체 테스트 (GET)
              </>
            )}
          </button>
          {testedCount > 0 && (
            <button
              onClick={onClearResults}
              className="flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg border border-white/10 text-white/40 text-xs hover:bg-white/5 hover:text-white/60 transition-colors"
            >
              <Trash2 size={12} />
              결과 초기화
            </button>
          )}
        </div>
      </div>

      {/* Batch Progress Bar */}
      {isBatchTesting && (
        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{
              width: `${batchProgress.total > 0 ? (batchProgress.completed / batchProgress.total) * 100 : 0}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${bgColor} border border-white/5`}>
      <span className={color}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-white/30 text-[10px] leading-none">{label}</span>
        <span className={`text-sm font-bold ${color} leading-tight`}>{value}</span>
      </div>
    </div>
  );
}
