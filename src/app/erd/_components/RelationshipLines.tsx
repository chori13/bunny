"use client";

import {
  tables as allTables,
  relationships,
  CARD_WIDTH,
  ROW_HEIGHT,
  HEADER_HEIGHT,
  type Table,
} from "./erd-data";

interface RelationshipLinesProps {
  selectedTable: string | null;
  hoveredTable: string | null;
}

function getColumnIndex(table: Table, columnName: string): number {
  return table.columns.findIndex((c) => c.name === columnName);
}

function getAnchor(
  table: Table,
  columnName: string,
  side: "left" | "right"
): { x: number; y: number } {
  const colIdx = getColumnIndex(table, columnName);
  const x = side === "right" ? table.position.x + CARD_WIDTH : table.position.x;
  const y = table.position.y + HEADER_HEIGHT + colIdx * ROW_HEIGHT + ROW_HEIGHT / 2 + 4;
  return { x, y };
}

export default function RelationshipLines({
  selectedTable,
  hoveredTable,
}: RelationshipLinesProps) {
  const tableMap = new Map(allTables.map((t) => [t.id, t]));

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="rgba(124,58,237,0.5)" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="rgba(167,139,250,0.9)" />
        </marker>
      </defs>
      {relationships.map((rel, i) => {
        const fromTable = tableMap.get(rel.from);
        const toTable = tableMap.get(rel.to);
        if (!fromTable || !toTable) return null;

        const isActive =
          selectedTable === rel.from ||
          selectedTable === rel.to ||
          hoveredTable === rel.from ||
          hoveredTable === rel.to;

        const hasSelection = selectedTable !== null;
        const opacity = hasSelection ? (isActive ? 1 : 0.1) : isActive ? 1 : 0.4;

        // Determine which side to connect from/to
        const fromCenterX = fromTable.position.x + CARD_WIDTH / 2;
        const toCenterX = toTable.position.x + CARD_WIDTH / 2;

        let fromSide: "left" | "right";
        let toSide: "left" | "right";

        if (fromCenterX < toCenterX) {
          fromSide = "right";
          toSide = "left";
        } else if (fromCenterX > toCenterX) {
          fromSide = "left";
          toSide = "right";
        } else {
          // Same column — connect right to right with a detour
          fromSide = "right";
          toSide = "right";
        }

        const from = getAnchor(fromTable, rel.fromColumn, fromSide);
        const to = getAnchor(toTable, rel.toColumn, toSide);

        let d: string;
        if (fromSide === toSide) {
          // Same side — curve outward
          const offset = 50;
          const outX = fromSide === "right" ? Math.max(from.x, to.x) + offset : Math.min(from.x, to.x) - offset;
          d = `M ${from.x} ${from.y} C ${outX} ${from.y}, ${outX} ${to.y}, ${to.x} ${to.y}`;
        } else {
          const midX = (from.x + to.x) / 2;
          d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
        }

        const strokeColor = isActive ? "rgba(167,139,250,0.7)" : "rgba(124,58,237,0.3)";

        return (
          <g key={i} style={{ opacity, transition: "opacity 0.3s" }}>
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isActive ? 2 : 1.5}
              markerEnd={`url(#arrowhead${isActive ? "-active" : ""})`}
            />
            {/* Cardinality labels */}
            <text
              x={from.x + (fromSide === "right" ? 12 : -12)}
              y={from.y - 6}
              fill={isActive ? "rgba(167,139,250,0.9)" : "rgba(167,139,250,0.4)"}
              fontSize="10"
              textAnchor="middle"
            >
              N
            </text>
            <text
              x={to.x + (toSide === "left" ? -12 : 12)}
              y={to.y - 6}
              fill={isActive ? "rgba(167,139,250,0.9)" : "rgba(167,139,250,0.4)"}
              fontSize="10"
              textAnchor="middle"
            >
              1
            </text>
          </g>
        );
      })}
    </svg>
  );
}
