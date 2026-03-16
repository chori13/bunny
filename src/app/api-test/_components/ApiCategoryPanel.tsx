"use client";

import { ChevronDown, Search, X, ChevronsUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { endpoints, categories, type ApiCategory, type ApiEndpoint, type HttpMethod, type TestResult } from "./api-data";
import MethodBadge from "./MethodBadge";

interface ApiCategoryPanelProps {
  selectedEndpoint: string | null;
  testResults: Map<string, TestResult[]>;
  onSelect: (endpointId: string) => void;
}

const methodFilters: (HttpMethod | "ALL")[] = ["ALL", "GET", "POST", "PUT", "DELETE"];

export default function ApiCategoryPanel({
  selectedEndpoint,
  testResults,
  onSelect,
}: ApiCategoryPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<HttpMethod | "ALL">("ALL");

  const toggle = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleAll = () => {
    const allCollapsed = categories.every((c) => collapsed.has(c));
    if (allCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(categories));
    }
  };

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesMethod = methodFilter === "ALL" || ep.method === methodFilter;
      const matchesSearch =
        !searchQuery ||
        ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesMethod && matchesSearch;
    });
  }, [searchQuery, methodFilter]);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => ({
        category: cat,
        items: filteredEndpoints.filter((e) => e.category === cat),
      }))
      .filter((g) => g.items.length > 0);
  }, [filteredEndpoints]);

  const isFiltering = searchQuery || methodFilter !== "ALL";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col max-h-[calc(100vh-280px)]">
      {/* Search + Filter */}
      <div className="p-3 border-b border-white/5 space-y-2 flex-shrink-0">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="API 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Method Filter + Toggle All */}
        <div className="flex items-center gap-1">
          {methodFilters.map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                methodFilter === method
                  ? method === "ALL"
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : method === "GET"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : method === "POST"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : method === "PUT"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-white/30 hover:bg-white/5 border border-transparent"
              }`}
            >
              {method}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={toggleAll}
            className="p-1 rounded text-white/20 hover:text-white/40 hover:bg-white/5 transition-colors"
            title="전체 펼침/접기"
          >
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Endpoint List */}
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {grouped.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-white/20">검색 결과가 없습니다</p>
          </div>
        ) : (
          grouped.map(({ category, items }) => {
            const isOpen = !collapsed.has(category) || isFiltering;
            const allItems = endpoints.filter((e) => e.category === category);
            const tested = allItems.filter((ep) => testResults.has(ep.id));
            const passed = tested.filter((ep) => {
              const r = testResults.get(ep.id);
              return r && r.length > 0 && r[0].success;
            });
            const failed = tested.length - passed.length;

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggle(category)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={category} />
                    <span className="text-xs font-semibold text-white/80">{category}</span>
                    <span className="text-[10px] text-white/30">
                      {isFiltering ? `${items.length}/${allItems.length}` : items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tested.length > 0 && (
                      <div className="flex items-center gap-1">
                        {passed.length > 0 && (
                          <span className="text-[10px] text-emerald-400">{passed.length}</span>
                        )}
                        {failed > 0 && (
                          <span className="text-[10px] text-red-400">{failed}</span>
                        )}
                        <span className="text-[10px] text-white/20">/ {allItems.length}</span>
                      </div>
                    )}
                    <ChevronDown
                      size={14}
                      className={`text-white/30 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                    />
                  </div>
                </button>

                {/* Endpoint List */}
                {isOpen && (
                  <div>
                    {items.map((ep) => (
                      <EndpointRow
                        key={ep.id}
                        endpoint={ep}
                        isSelected={selectedEndpoint === ep.id}
                        result={testResults.get(ep.id)?.[0]}
                        onClick={() => onSelect(ep.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
        <span className="text-[10px] text-white/20">
          {isFiltering
            ? `${filteredEndpoints.length}개 표시 / 총 ${endpoints.length}개`
            : `총 ${endpoints.length}개 API`}
        </span>
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: ApiCategory }) {
  const icons: Record<ApiCategory, string> = {
    Auth: "🔐",
    Products: "📦",
    Events: "🎉",
    Community: "💬",
    Wishlist: "❤️",
  };
  return <span className="text-xs">{icons[category]}</span>;
}

function EndpointRow({
  endpoint,
  isSelected,
  result,
  onClick,
}: {
  endpoint: ApiEndpoint;
  isSelected: boolean;
  result?: TestResult;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-white/5 transition-colors border-l-2 group ${
        isSelected ? "border-violet-500 bg-violet-500/5" : "border-transparent"
      }`}
    >
      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          result === undefined
            ? "bg-white/15"
            : result.success
              ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
              : "bg-red-400 shadow-sm shadow-red-400/50"
        }`}
      />

      <MethodBadge method={endpoint.method} />

      <span className={`text-xs truncate flex-1 ${isSelected ? "text-white/80" : "text-white/50 group-hover:text-white/70"}`}>
        {endpoint.name}
      </span>

      {/* Auth/Admin indicators */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {endpoint.requiresAdmin && <span className="text-[8px]" title="관리자 전용">🛡️</span>}
        {endpoint.requiresAuth && !endpoint.requiresAdmin && <span className="text-[8px]" title="로그인 필요">🔒</span>}
      </div>

      {result && (
        <span className={`text-[10px] flex-shrink-0 ${result.responseTime > 500 ? "text-amber-400/50" : "text-white/20"}`}>
          {result.responseTime}ms
        </span>
      )}
    </button>
  );
}
