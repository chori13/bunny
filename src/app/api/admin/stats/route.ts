import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const [
      userCount,
      productCount,
      orderCount,
      postCount,
      eventCount,
      recentOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.post.count(),
      prisma.event.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { totalAmount: true },
      }),
    ]);

    return NextResponse.json({
      userCount,
      productCount,
      orderCount,
      postCount,
      eventCount,
      recentOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("관리자 통계 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}