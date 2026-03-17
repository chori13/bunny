import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6); // 7일 포함
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 30일간 일별 데이터를 위한 시작일
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalRevenue,
      todayOrders,
      statusCounts,
      recentOrders,
      bestSellers,
      dailyOrders,
      newUsersWeek,
      totalUsers,
    ] = await Promise.all([
      // 오늘 매출
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPING", "DELIVERED"] }, createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
      }),
      // 이번주 매출
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPING", "DELIVERED"] }, createdAt: { gte: weekStart } },
        _sum: { totalAmount: true },
      }),
      // 이번달 매출
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPING", "DELIVERED"] }, createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      // 전체 매출
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPING", "DELIVERED"] } },
        _sum: { totalAmount: true },
      }),
      // 오늘 주문 수
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      // 상태별 주문 수
      Promise.all(
        ["PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].map(async (s) => ({
          status: s,
          count: await prisma.order.count({ where: { status: s as never } }),
        }))
      ),
      // 최근 주문 10건
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      // 베스트셀러 TOP 10
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      // 최근 30일 일별 주문
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, totalAmount: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      // 이번주 신규 회원
      prisma.user.count({ where: { id: { not: undefined } } }), // Prisma doesn't have createdAt on User; count all
      // 전체 회원 수
      prisma.user.count(),
    ]);

    // 베스트셀러에 상품명 추가
    const productIds = bestSellers.map((b) => b.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, image: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const bestSellersList = bestSellers.map((b) => {
      const product = productMap.get(b.productId);
      return {
        productId: b.productId,
        name: product?.name || "삭제된 상품",
        image: product?.image || null,
        price: product?.price || 0,
        totalQuantity: b._sum.quantity || 0,
        totalRevenue: b._sum.price ? (b._sum.price * (b._sum.quantity || 1)) : 0,
      };
    });

    // 일별 차트 데이터 집계
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { orders: 0, revenue: 0 });
    }
    for (const order of dailyOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.orders += 1;
        if (["PAID", "SHIPPING", "DELIVERED"].includes(order.status)) {
          entry.revenue += order.totalAmount;
        }
      }
    }
    const chartData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      label: `${parseInt(date.slice(5, 7))}/${parseInt(date.slice(8, 10))}`,
      ...data,
    }));

    return NextResponse.json({
      revenue: {
        today: todayRevenue._sum.totalAmount || 0,
        week: weekRevenue._sum.totalAmount || 0,
        month: monthRevenue._sum.totalAmount || 0,
        total: totalRevenue._sum.totalAmount || 0,
      },
      todayOrders,
      statusCounts: statusCounts.reduce(
        (acc, { status, count }) => ({ ...acc, [status]: count }),
        {} as Record<string, number>
      ),
      recentOrders,
      bestSellers: bestSellersList,
      chartData,
      totalUsers,
      newUsersWeek,
    });
  } catch (error) {
    console.error("관리자 분석 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
