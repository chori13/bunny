"use client";

import type { HttpMethod } from "./api-data";

const styles: Record<HttpMethod, string> = {
  GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold border leading-none min-w-[42px] ${styles[method]}`}
    >
      {method}
    </span>
  );
}
