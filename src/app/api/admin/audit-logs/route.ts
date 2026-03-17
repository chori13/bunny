import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";
    const targetType = url.searchParams.get("targetType") || "";
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = 30;

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (search) {
      where.OR = [
        { adminName: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
        { detail: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total, actionCounts] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where: where as never }),
      prisma.auditLog.groupBy({
        by: ["action"],
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      actionCounts: actionCounts.reduce(
        (acc, { action: a, _count }) => ({ ...acc, [a]: _count.id }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error("감사 로그 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
