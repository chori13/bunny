"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  CalendarDays,
  Database,
  FlaskConical,
  Rabbit,
  LogOut,
  Home,
  ShoppingBag,
  MessageSquare,
  Megaphone,
  Users,
  BarChart3,
  Star,
  ScrollText,
  Settings,
  TrendingUp,
  Bug,
  Github,
} from "lucide-react";

const navItems = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "상품 등록", href: "/admin/products-register", icon: PlusCircle },
  { label: "주문 관리", href: "/admin/orders", icon: ShoppingBag },
  { label: "회원 관리", href: "/admin/users", icon: Users },
  { label: "리뷰 관리", href: "/admin/reviews", icon: Star },
  { label: "매출 분석", href: "/admin/analytics", icon: BarChart3 },
  { label: "주식 정보", href: "/admin/stocks", icon: TrendingUp },
  { label: "이벤트 관리", href: "/admin/events-manage", icon: CalendarDays },
  { label: "공지사항", href: "/admin/notices", icon: Megaphone },
  { label: "감사 로그", href: "/admin/audit-logs", icon: ScrollText },
  { label: "사이트 설정", href: "/admin/settings", icon: Settings },
  { label: "ERD", href: "/admin/erd", icon: Database },
  { label: "API 테스트", href: "/admin/api-test", icon: FlaskConical },
  { label: "Sentry 모니터링", href: "/admin/sentry", icon: Bug },
  { label: "GitHub 관리", href: "/admin/github", icon: Github },
];

const quickLinks = [
  { label: "상품 목록", href: "/admin/products", icon: Package },
  { label: "커뮤니티", href: "/admin/community", icon: MessageSquare },
  { label: "사이트 홈", href: "/", icon: Home },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "loading" && (!session || session.user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 - 항상 노출 */}
      <aside className="fixed top-0 left-0 z-40 flex h-screen w-60 flex-col border-r border-white/5 bg-[#0a0a0c]">
        {/* 로고 */}
        <div className="flex h-16 items-center gap-2 border-b border-white/5 px-5">
          <Rabbit className="h-5 w-5 text-violet-400" />
          <span className="text-sm font-bold gradient-text">Bunny Admin</span>
        </div>

        {/* 관리 메뉴 */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            관리
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            바로가기
          </p>
          <div className="space-y-0.5">
            {quickLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-violet-500/10 text-violet-400"
                      : "text-white/40 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 하단 유저 영역 */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400">
              {session.user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {session.user?.name}
              </p>
              <p className="text-[11px] text-white/30">관리자</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-white/30 transition hover:bg-white/5 hover:text-white"
              title="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 - 사이드바 너비만큼 왼쪽 여백 */}
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}