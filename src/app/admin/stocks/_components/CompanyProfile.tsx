"use client";

import { Globe, Users, Building2, Briefcase } from "lucide-react";
import type { UnifiedStockData } from "@/types/stock";

export default function CompanyProfile({ data }: { data: UnifiedStockData }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-xs font-semibold text-white/60 mb-3">기업 개요</h3>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.sector && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
            <Building2 size={12} className="text-violet-400/50 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/25">섹터</p>
              <p className="text-xs text-white/60">{data.sector}</p>
            </div>
          </div>
        )}
        {data.industry && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
            <Briefcase size={12} className="text-violet-400/50 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/25">산업</p>
              <p className="text-xs text-white/60">{data.industry}</p>
            </div>
          </div>
        )}
        {data.employees && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
            <Users size={12} className="text-violet-400/50 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/25">직원 수</p>
              <p className="text-xs text-white/60">{data.employees.toLocaleString()}명</p>
            </div>
          </div>
        )}
        {data.website && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
            <Globe size={12} className="text-violet-400/50 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-white/25">웹사이트</p>
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-400 hover:underline truncate block max-w-[160px]"
              >
                {data.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <div className="px-3 py-3 rounded-lg bg-black/20 border border-white/5">
          <p className="text-[10px] text-white/25 mb-1">사업 설명</p>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-6">{data.description}</p>
        </div>
      )}

      {!data.description && !data.sector && !data.industry && (
        <p className="text-xs text-white/20 text-center py-4">기업 정보를 불러올 수 없습니다</p>
      )}
    </div>
  );
}