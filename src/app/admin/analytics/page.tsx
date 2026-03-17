"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import RevenueCards from "./_components/RevenueCards";
import SalesChart from "./_components/SalesChart";
import OrderStatusCards from "./_components/OrderStatusCards";
import BestSellers from "./_components/BestSellers";
import RecentOrdersFeed from "./_components/RecentOrdersFeed";
import UserStats from "./_components/UserStats";

interface AnalyticsData {
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  todayOrders: number;
  statusCounts: Record<string, number>;
  recentOrders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string };
    items: { product: { name: string } }[];
  }[];
  bestSellers: {
    productId: string;
    name: string;
    image: string | null;
    price: number;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  chartData: {
    date: string;
    label: string;
    orders: number;
    revenue: number;
  }[];
  totalUsers: number;
  newUsersWeek: number;
}

export default function AdminAnalyticsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch analytics
  useEffect(() => {
    if (authStatus !== "authenticated" || session?.user?.role !== "ADMIN") return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("데이터를 불러올 수 없습니다.");
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authStatus, session]);

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400 mb-2">오류 발생</p>
          <p className="text-xs text-white/40">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
          <BarChart3 size={12} />
          Sales Analytics
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">매출 분석</h1>
        <p className="text-white/40 text-sm">
          매출, 주문, 베스트셀러 등 핵심 지표를 한눈에 확인하세요
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="mb-6">
        <RevenueCards
          today={data.revenue.today}
          week={data.revenue.week}
          month={data.revenue.month}
          total={data.revenue.total}
        />
      </div>

      {/* Sales Chart */}
      <div className="mb-6">
        <SalesChart data={data.chartData} />
      </div>

      {/* Two Column: Order Status + User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrderStatusCards
          statusCounts={data.statusCounts}
          todayOrders={data.todayOrders}
        />
        <UserStats
          totalUsers={data.totalUsers}
          newUsersWeek={data.newUsersWeek}
        />
      </div>

      {/* Two Column: Best Sellers + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BestSellers items={data.bestSellers} />
        <RecentOrdersFeed orders={data.recentOrders} />
      </div>
    </div>
  );
}
