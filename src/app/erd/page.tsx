"use client";

import { Database } from "lucide-react";
import ErdViewer from "./_components/ErdViewer";

export default function ErdPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
            <Database size={12} />
            Entity Relationship Diagram
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            데이터베이스 ERD
          </h1>
          <p className="text-white/40 text-sm">
            테이블을 클릭하면 관련 테이블과 관계가 하이라이트됩니다
          </p>
        </div>

        {/* ERD Viewer */}
        <ErdViewer />
      </div>
    </div>
  );
}
