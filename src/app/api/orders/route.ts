import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 주문 생성 (결제 전)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { items, recipientName, phone, address, memo } = await req.json();

    if (!items?.length || !recipientName?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    // 주문 아이템 구조 검증
    for (const item of items) {
      if (!item.productId || typeof item.productId !== "string") {
        return NextResponse.json({ error: "잘못된 상품 정보입니다." }, { status: 400 });
      }
      if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json({ error: "수량은 1개 이상이어야 합니다." }, { status: 400 });
      }
      if (!item.price || typeof item.price !== "number" || item.price <= 0) {
        return NextResponse.json({ error: "잘못된 가격 정보입니다." }, { status: 400 });
      }
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        memo: memo?.trim() || null,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("주문 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 내 주문 목록
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: { select: { name: true, image: true } } },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("주문 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
