import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        items: {
          include: { product: { select: { name: true, image: true, price: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("주문 상세 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    const { status: newStatus } = await req.json();

    if (!newStatus || !["PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"].includes(newStatus)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `${order.status}에서 ${newStatus}로 변경할 수 없습니다.` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus as never },
      include: {
        user: { select: { name: true } },
        items: {
          include: { product: { select: { name: true, image: true } } },
        },
      },
    });

    await createAuditLog({
      action: "ORDER_STATUS_CHANGE",
      targetType: "Order",
      targetId: id,
      detail: { from: order.status, to: newStatus },
      adminId: session.user.id,
      adminName: session.user.name || "관리자",
    });

    return NextResponse.json({ message: "주문 상태가 변경되었습니다.", order: updated });
  } catch (error) {
    console.error("주문 상태 변경 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
