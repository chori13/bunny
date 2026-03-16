"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface ResponseViewerProps {
  body: unknown;
  maxHeight?: string;
}

export default function ResponseViewer({ body, maxHeight = "max-h-96" }: ResponseViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());

  const formatted = (() => {
    if (body === null || body === undefined) return "null";
    if (typeof body === "string") return body;
    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  })();

  const lineCount = formatted.split("\n").length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleKey = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isJsonObject = body !== null && body !== undefined && typeof body === "object";

  return (
    <div className={`${expanded ? "max-h-[70vh]" : maxHeight} overflow-auto rounded-xl bg-black/30 border border-white/5 relative group`}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-1.5 bg-black/40 backdrop-blur-sm border-b border-white/5">
        <span className="text-[10px] text-white/20">
          {lineCount} lines {isJsonObject && Array.isArray(body) ? `(${(body as unknown[]).length} items)` : ""}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors"
            title={expanded ? "축소" : "확장"}
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            {copied ? (
              <>
                <Check size={10} className="text-emerald-400" />
                <span className="text-emerald-400">복사됨</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Tree or Plain text */}
      {isJsonObject ? (
        <div className="p-3">
          <JsonTree data={body} collapsedKeys={collapsedKeys} onToggle={toggleKey} path="" />
        </div>
      ) : (
        <pre className="p-4 text-xs font-mono text-white/70 whitespace-pre-wrap break-words">
          {formatted}
        </pre>
      )}
    </div>
  );
}

function JsonTree({
  data,
  collapsedKeys,
  onToggle,
  path,
  depth = 0,
}: {
  data: unknown;
  collapsedKeys: Set<string>;
  onToggle: (key: string) => void;
  path: string;
  depth?: number;
}) {
  if (data === null) return <span className="text-orange-400/70 font-mono text-xs">null</span>;
  if (data === undefined) return <span className="text-white/30 font-mono text-xs">undefined</span>;
  if (typeof data === "boolean")
    return <span className="text-amber-400/80 font-mono text-xs">{String(data)}</span>;
  if (typeof data === "number")
    return <span className="text-cyan-400/80 font-mono text-xs">{data}</span>;
  if (typeof data === "string") {
    // Truncate very long strings
    const display = data.length > 200 ? data.slice(0, 200) + "..." : data;
    return <span className="text-emerald-400/70 font-mono text-xs">&quot;{display}&quot;</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-white/30 font-mono text-xs">[]</span>;

    const isCollapsed = collapsedKeys.has(path);
    return (
      <span className="font-mono text-xs">
        <button
          onClick={() => onToggle(path)}
          className="inline-flex items-center text-white/30 hover:text-white/50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
          <span className="text-white/20">[</span>
          {isCollapsed && <span className="text-white/20 mx-1">{data.length} items</span>}
        </button>
        {!isCollapsed && (
          <div style={{ paddingLeft: 16 }}>
            {data.map((item, i) => (
              <div key={i} className="flex">
                <span className="text-white/15 mr-2 select-none w-4 text-right flex-shrink-0">{i}</span>
                <JsonTree data={item} collapsedKeys={collapsedKeys} onToggle={onToggle} path={`${path}[${i}]`} depth={depth + 1} />
                {i < data.length - 1 && <span className="text-white/20">,</span>}
              </div>
            ))}
          </div>
        )}
        {!isCollapsed && <span className="text-white/20">]</span>}
        {isCollapsed && <span className="text-white/20">]</span>}
      </span>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-white/30 font-mono text-xs">{"{}"}</span>;

    const isCollapsed = collapsedKeys.has(path);
    return (
      <span className="font-mono text-xs">
        <button
          onClick={() => onToggle(path)}
          className="inline-flex items-center text-white/30 hover:text-white/50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
          <span className="text-white/20">{"{"}</span>
          {isCollapsed && <span className="text-white/20 mx-1">{entries.length} keys</span>}
        </button>
        {!isCollapsed && (
          <div style={{ paddingLeft: 16 }}>
            {entries.map(([key, value], i) => (
              <div key={key} className="flex flex-wrap">
                <span className="text-violet-400/70 mr-1">&quot;{key}&quot;</span>
                <span className="text-white/20 mr-1">:</span>
                <JsonTree data={value} collapsedKeys={collapsedKeys} onToggle={onToggle} path={`${path}.${key}`} depth={depth + 1} />
                {i < entries.length - 1 && <span className="text-white/20">,</span>}
              </div>
            ))}
          </div>
        )}
        {!isCollapsed && <span className="text-white/20">{"}"}</span>}
        {isCollapsed && <span className="text-white/20">{"}"}</span>}
      </span>
    );
  }

  return <span className="text-white/50 font-mono text-xs">{String(data)}</span>;
}
