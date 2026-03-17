import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 장바구니 조회
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: { id: true, name: true, image: true, price: true },
        },
      },
      orderBy: { id: "desc" },
    });

    const items = cartItems.map((ci) => ({
      id: ci.product.id,
      name: ci.product.name,
      price: ci.product.price,
      image: ci.product.image,
      quantity: ci.quantity,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("장바구니 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 장바구니 동기화 (클라이언트 → 서버)
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    // 기존 장바구니 삭제 후 새로 생성
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId: session.user!.id! } });

      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items
            .filter((item: { id: string; quantity: number }) => item.id && item.quantity > 0)
            .map((item: { id: string; quantity: number }) => ({
              userId: session.user!.id!,
              productId: item.id,
              quantity: item.quantity,
            })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("장바구니 동기화 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 장바구니 비우기
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("장바구니 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
