"use client";

import { useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, KeyRound, Link2, ArrowRight, X } from "lucide-react";
import { tables, relationships, enums, type Table } from "./erd-data";
import TableCard from "./TableCard";
import RelationshipLines from "./RelationshipLines";

const ZOOM_LEVELS = [0.5, 0.65, 0.8, 1, 1.15, 1.3];

export default function ErdViewer() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [detailTable, setDetailTable] = useState<Table | null>(null);
  const [zoomIndex, setZoomIndex] = useState(3);

  const zoom = ZOOM_LEVELS[zoomIndex];

  const relatedTables = new Set<string>();
  if (selectedTable) {
    relationships.forEach((rel) => {
      if (rel.from === selectedTable) relatedTables.add(rel.to);
      if (rel.to === selectedTable) relatedTables.add(rel.from);
    });
  }

  const handleTableClick = useCallback((tableId: string) => {
    setSelectedTable((prev) => (prev === tableId ? null : tableId));
  }, []);

  const handleTableDoubleClick = useCallback((tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (table) setDetailTable(table);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedTable(null);
    }
  }, []);

  const tableRelations = detailTable
    ? relationships.filter(
        (r) => r.from === detailTable.id || r.to === detailTable.id
      )
    : [];

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 220px)" }}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1))}
          disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <ZoomIn size={16} className="text-white/60" />
        </button>
        <button
          onClick={() => setZoomIndex(3)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <RotateCcw size={16} className="text-white/60" />
        </button>
        <button
          onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))}
          disabled={zoomIndex <= 0}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <ZoomOut size={16} className="text-white/60" />
        </button>
        <div className="text-center text-[10px] text-white/30 mt-1">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-4 text-[11px] text-white/40 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <KeyRound size={11} className="text-violet-400" /> PK
        </span>
        <span className="flex items-center gap-1.5">
          <Link2 size={11} className="text-indigo-400" /> FK
        </span>
        <span className="flex items-center gap-1.5">
          <ArrowRight size={11} className="text-violet-400/60" /> N:1 관계
        </span>
        <span className="text-white/25">| 더블클릭: 상세보기</span>
        {enums.map((e) => (
          <span key={e.name} className="flex items-center gap-1">
            <span className="text-emerald-400/70">{e.name}</span>
            <span className="text-white/20">({e.values.join(", ")})</span>
          </span>
        ))}
      </div>

      {/* Canvas */}
      <div
        className="w-full h-full overflow-auto rounded-xl border border-white/5 bg-[#0a0a0c]"
        onClick={handleCanvasClick}
      >
        <div
          className="relative"
          style={{
            width: 1350,
            height: 1050,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <RelationshipLines
            selectedTable={selectedTable}
            hoveredTable={hoveredTable}
          />
          {tables.map((table) => {
            const isSelected = selectedTable === table.id;
            const isRelated = relatedTables.has(table.id);
            const isDimmed = selectedTable !== null && !isSelected && !isRelated;

            return (
              <div key={table.id} onDoubleClick={() => handleTableDoubleClick(table.id)}>
                <TableCard
                  table={table}
                  isSelected={isSelected}
                  isRelated={isRelated}
                  isDimmed={isDimmed}
                  onClick={() => handleTableClick(table.id)}
                  onMouseEnter={() => setHoveredTable(table.id)}
                  onMouseLeave={() => setHoveredTable(null)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 패널 */}
      {detailTable && (
        <div className="absolute inset-y-0 right-0 z-30 w-96 overflow-y-auto border-l border-white/10 bg-[#0f0f11]/95 backdrop-blur-xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f0f11]/90 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {detailTable.name}
              </h2>
              <p className="text-xs text-white/40">{detailTable.comment}</p>
            </div>
            <button
              onClick={() => setDetailTable(null)}
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 컬럼 목록 */}
            <div>
              <h3 className="mb-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                컬럼 ({detailTable.columns.length})
              </h3>
              <div className="space-y-1">
                {detailTable.columns.map((col) => (
                  <div
                    key={col.name}
                    className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      {col.isPk && (
                        <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-400">
                          PK
                        </span>
                      )}
                      {col.isFk && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                          FK
                        </span>
                      )}
                      {col.isUnique && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                          UQ
                        </span>
                      )}
                      <span className="text-sm font-medium text-white">{col.name}</span>
                      <span className="text-xs text-white/30">{col.label}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-white/40">
                      <span>타입: <span className="text-white/60">{col.type}</span></span>
                      <span>{col.isOptional ? "NULL 허용" : "NOT NULL"}</span>
                      {col.default && (
                        <span>
                          기본값: <span className="text-white/60">{col.default}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 관계 */}
            {tableRelations.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                  관계 ({tableRelations.length})
                </h3>
                <div className="space-y-2">
                  {tableRelations.map((rel, i) => {
                    const isFrom = rel.from === detailTable.id;
                    const targetId = isFrom ? rel.to : rel.from;
                    const targetTable = tables.find((t) => t.id === targetId);

                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer transition hover:bg-white/[0.04]"
                        onClick={() => {
                          if (targetTable) setDetailTable(targetTable);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-white">
                              {isFrom ? rel.fromColumn : rel.toColumn}
                            </span>
                            <ArrowRight size={12} className="text-violet-400/50 shrink-0" />
                            <span className="text-violet-400">
                              {targetId}
                            </span>
                            <span className="text-white/30">.{isFrom ? rel.toColumn : rel.fromColumn}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-white/30">
                            <span>{isFrom ? "N : 1" : "1 : N"}</span>
                            {rel.onDelete && (
                              <span>삭제: {rel.onDelete}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 유니크 제약 */}
            {(detailTable.id === "CartItem" || detailTable.id === "Wishlist") && (
              <div>
                <h3 className="mb-3 text-xs font-semibold text-white/50 uppercase tracking-wider">
                  유니크 제약
                </h3>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-white/60">
                  <code>(userId, productId)</code>
                  <p className="mt-1 text-white/30">같은 사용자가 같은 상품을 중복 등록 불가</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}