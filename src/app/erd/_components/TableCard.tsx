"use client";

import { KeyRound, Link2 } from "lucide-react";
import type { Table } from "./erd-data";

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function TableCard({
  table,
  isSelected,
  isRelated,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: TableCardProps) {
  return (
    <div
      className="absolute select-none"
      style={{ left: table.position.x, top: table.position.y, width: 260 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`
          rounded-xl border backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden
          ${isSelected
            ? "border-violet-500/60 bg-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]"
            : isRelated
              ? "border-violet-500/30 bg-white/8"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }
          ${isDimmed ? "opacity-25 pointer-events-none" : ""}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/5">
          <span className="font-semibold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {table.name}
          </span>
          <span className="text-[11px] text-white/40">{table.comment}</span>
        </div>

        {/* Columns */}
        <div className="py-1">
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 px-4 py-[5px] hover:bg-white/5 text-xs"
            >
              {/* Icon */}
              <span className="w-4 flex-shrink-0 flex justify-center">
                {col.isPk ? (
                  <KeyRound size={12} className="text-violet-400" />
                ) : col.isFk ? (
                  <Link2 size={12} className="text-indigo-400" />
                ) : null}
              </span>

              {/* Name + Label */}
              <span className={`flex-1 min-w-0 ${col.isFk ? "text-indigo-300" : "text-white/80"}`}>
                {col.name}
                {col.isOptional && <span className="text-white/30">?</span>}
                <span className="ml-1 text-[10px] text-white/25">{col.label}</span>
              </span>

              {/* Type */}
              <span className="text-white/30 text-[11px] shrink-0">{col.type}</span>

              {/* Badges */}
              {col.isUnique && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 leading-none">
                  UQ
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
