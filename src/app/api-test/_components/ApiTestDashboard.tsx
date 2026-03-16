"use client";

import { useState, useCallback } from "react";
import { MousePointerClick } from "lucide-react";
import { endpoints, type TestResult } from "./api-data";
import ApiTestSummary from "./ApiTestSummary";
import ApiCategoryPanel from "./ApiCategoryPanel";
import ApiTestPanel from "./ApiTestPanel";

export default function ApiTestDashboard() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, TestResult[]>>(new Map());
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 });
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const addResult = useCallback((result: TestResult) => {
    setTestResults((prev) => {
      const next = new Map(prev);
      const existing = next.get(result.endpointId) || [];
      next.set(result.endpointId, [result, ...existing].slice(0, 5));
      return next;
    });
  }, []);

  const testEndpoint = useCallback(
    async (endpointId: string, resolvedPath: string, body?: Record<string, unknown>) => {
      const endpoint = endpoints.find((e) => e.id === endpointId);
      if (!endpoint) return;

      setTestingEndpoint(endpointId);

      const startTime = performance.now();
      try {
        const options: RequestInit = { method: endpoint.method };

        if (body && endpoint.contentType === "json") {
          options.headers = { "Content-Type": "application/json" };
          options.body = JSON.stringify(body);
        } else if (body && endpoint.contentType === "multipart") {
          const formData = new FormData();
          Object.entries(body).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });
          options.body = formData;
        }

        const response = await fetch(resolvedPath, options);
        const responseTime = Math.round(performance.now() - startTime);

        let responseBody: unknown;
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          responseBody = await response.json().catch(() => null);
        } else {
          const text = await response.text().catch(() => "");
          try {
            responseBody = JSON.parse(text);
          } catch {
            responseBody = text || null;
          }
        }

        addResult({
          endpointId,
          status: response.status,
          statusText: response.statusText,
          responseTime,
          responseBody,
          timestamp: new Date(),
          success: response.ok,
        });
      } catch (error) {
        const responseTime = Math.round(performance.now() - startTime);
        addResult({
          endpointId,
          status: 0,
          statusText: "Network Error",
          responseTime,
          responseBody: { error: error instanceof Error ? error.message : "Unknown error" },
          timestamp: new Date(),
          success: false,
        });
      } finally {
        setTestingEndpoint(null);
      }
    },
    [addResult]
  );

  const testAllSafe = useCallback(async () => {
    const getEndpoints = endpoints.filter((e) => e.method === "GET" && !e.pathParams && !e.queryParams);
    setIsBatchTesting(true);
    setBatchProgress({ completed: 0, total: getEndpoints.length });

    for (const ep of getEndpoints) {
      await testEndpoint(ep.id, ep.path);
      setBatchProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
    }

    setIsBatchTesting(false);
  }, [testEndpoint]);

  const clearResults = useCallback(() => {
    setTestResults(new Map());
  }, []);

  const selectedResults = selectedEndpoint ? testResults.get(selectedEndpoint) || [] : [];

  return (
    <div>
      <ApiTestSummary
        testResults={testResults}
        isBatchTesting={isBatchTesting}
        batchProgress={batchProgress}
        onTestAll={testAllSafe}
        onClearResults={clearResults}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Category Panel */}
        <div className="lg:w-[340px] flex-shrink-0">
          <ApiCategoryPanel
            selectedEndpoint={selectedEndpoint}
            testResults={testResults}
            onSelect={setSelectedEndpoint}
          />
        </div>

        {/* Right: Test Panel */}
        <div className="flex-1 min-w-0">
          {selectedEndpoint ? (
            <ApiTestPanel
              key={selectedEndpoint}
              endpointId={selectedEndpoint}
              results={selectedResults}
              onTest={testEndpoint}
              isTesting={testingEndpoint === selectedEndpoint}
            />
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center py-32">
              <div className="text-center">
                <MousePointerClick size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">좌측에서 테스트할 API를 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
