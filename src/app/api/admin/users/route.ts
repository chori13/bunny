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
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const sort = url.searchParams.get("sort") || "latest";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = 20;

    // Where 조건
    const where: Record<string, unknown> = {};
    if (role && ["USER", "ADMIN"].includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // 정렬
    let orderBy: Record<string, string> = { name: "asc" };
    if (sort === "latest") orderBy = { id: "desc" };
    else if (sort === "oldest") orderBy = { id: "asc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };
    else if (sort === "name_desc") orderBy = { name: "desc" };

    const [users, total, roleCounts] = await Promise.all([
      prisma.user.findMany({
        where: where as never,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              posts: true,
            },
          },
        },
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: where as never }),
      Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count(),
      ]),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      roleCounts: {
        USER: roleCounts[0],
        ADMIN: roleCounts[1],
        ALL: roleCounts[2],
      },
    });
  } catch (error) {
    console.error("회원 목록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
