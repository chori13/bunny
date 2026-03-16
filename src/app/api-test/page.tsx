"use client";

import { Activity } from "lucide-react";
import ApiTestDashboard from "./_components/ApiTestDashboard";

export default function ApiTestPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
            <Activity size={12} />
            API Testing & Monitoring
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            API 테스트 대시보드
          </h1>
          <p className="text-white/40 text-sm">
            테스트할 API를 선택하거나 전체 테스트를 실행하세요
          </p>
        </div>

        {/* Dashboard */}
        <ApiTestDashboard />
      </div>
    </div>
  );
}
