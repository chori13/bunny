"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  desc: string;
  period: string;
  icon: string;
  color: string | null;
  status: string;
}

const colorMap: Record<string, string> = {
  violet: "border-violet-500/20 bg-violet-500/5",
  emerald: "border-emerald-500/20 bg-emerald-500/5",
  blue: "border-blue-500/20 bg-blue-500/5",
};

const badgeColorMap: Record<string, string> = {
  violet: "bg-violet-500/20 text-violet-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  blue: "bg-blue-500/20 text-blue-400",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeEvents = events.filter((e) => e.status === "ACTIVE");
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING");
  const endedEvents = events.filter((e) => e.status === "ENDED");

  if (loading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* 헤더 */}
      <div className="mb-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
          <span className="text-lg">🎉</span> 다양한 혜택을 만나보세요
        </div>
        <h1 className="text-4xl font-bold gradient-text">이벤트</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/40">
          Bunny Shop에서 진행 중인 이벤트와 특별 혜택을 확인하세요
        </p>
      </div>

      {/* 진행중 이벤트 */}
      {activeEvents.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
              🔥
            </span>
            <h2 className="text-xl font-bold text-white">진행중인 이벤트</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {activeEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-2xl border p-6 transition hover:scale-[1.02] ${
                  event.color && colorMap[event.color]
                    ? colorMap[event.color]
                    : "border-violet-500/20 bg-violet-500/5"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">{event.icon}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      event.color && badgeColorMap[event.color]
                        ? badgeColorMap[event.color]
                        : "bg-violet-500/20 text-violet-400"
                    }`}
                  >
                    진행중
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{event.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{event.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                  <span>📅</span>
                  <span>{event.period}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 혜택 배너 */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-indigo-500/5" />
          <div className="relative">
            <p className="text-3xl">🐰</p>
            <h3 className="mt-3 text-xl font-bold text-white">
              회원이라면 누구나 혜택을!
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
              Bunny Shop 회원은 매월 특별 쿠폰과 적립금 혜택을 받을 수 있습니다
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/signup"
                className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              >
                회원가입
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                상품 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 예정 이벤트 */}
      {upcomingEvents.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-xl">
              📢
            </span>
            <h2 className="text-xl font-bold text-white">예정된 이벤트</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="glass rounded-2xl p-6 transition hover:border-yellow-500/20"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-400">
                    예정
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{event.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{event.desc}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
                  <span>📅</span>
                  <span>{event.period}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 종료 이벤트 */}
      {endedEvents.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">
              📋
            </span>
            <h2 className="text-xl font-bold text-white">종료된 이벤트</h2>
          </div>
          <div className="space-y-3">
            {endedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5 opacity-60"
              >
                <span className="shrink-0 text-2xl">{event.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{event.title}</h3>
                  <p className="mt-1 text-xs text-white/40">{event.desc}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/30">
                    종료
                  </span>
                  <p className="mt-1 text-xs text-white/20">{event.period}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 이벤트가 없는 경우 */}
      {events.length === 0 && (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-white/40">등록된 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
}