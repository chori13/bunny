import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// 회원 상세 조회
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            content: true,
            createdAt: true,
            product: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        posts: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            posts: true,
            comments: true,
            wishlists: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }

    // 총 주문 금액 계산
    const totalSpent = await prisma.order.aggregate({
      where: {
        userId: id,
        status: { in: ["PAID", "SHIPPING", "DELIVERED"] },
      },
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      ...user,
      totalSpent: totalSpent._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error("회원 상세 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 회원 역할 변경
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "유효하지 않은 역할입니다." }, { status: 400 });
    }

    // 자기 자신의 역할은 변경 불가
    if (id === session.user.id) {
      return NextResponse.json({ error: "자신의 역할은 변경할 수 없습니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role as never },
      select: { id: true, name: true, role: true },
    });

    await createAuditLog({
      action: "USER_ROLE_CHANGE",
      targetType: "User",
      targetId: id,
      detail: { name: user.name, from: user.role, to: role },
      adminId: session.user.id,
      adminName: session.user.name || "관리자",
    });

    return NextResponse.json({ message: "역할이 변경되었습니다.", user: updated });
  } catch (error) {
    console.error("회원 역할 변경 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
