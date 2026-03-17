import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const sort = searchParams.get("sort") || "latest";

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status && ["PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { recipientName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "amount_high") orderBy = { totalAmount: "desc" };
    else if (sort === "amount_low") orderBy = { totalAmount: "asc" };

    const [orders, total, statusCounts] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true } },
          items: {
            include: { product: { select: { name: true, image: true } } },
          },
        },
      }),
      prisma.order.count({ where }),
      // 각 상태별 건수
      Promise.all(
        ["PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].map(async (s) => ({
          status: s,
          count: await prisma.order.count({ where: { status: s as never } }),
        }))
      ),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      statusCounts: statusCounts.reduce(
        (acc, { status, count }) => ({ ...acc, [status]: count }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error("관리자 주문 목록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
