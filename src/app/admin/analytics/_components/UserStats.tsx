"use client";

import { Users } from "lucide-react";

interface UserStatsProps {
  totalUsers: number;
  newUsersWeek: number;
}

export default function UserStats({ totalUsers, newUsersWeek }: UserStatsProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Users size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-white">회원 현황</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
          <p className="text-[11px] text-white/30 mt-1">전체 회원</p>
        </div>
        <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-4 text-center">
          <p className="text-2xl font-bold text-violet-400">{newUsersWeek}</p>
          <p className="text-[11px] text-white/30 mt-1">전체 회원 (활성)</p>
        </div>
      </div>
    </div>
  );
}
