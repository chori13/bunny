import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 찜 여부 확인
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ wished: false });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId가 필요합니다." }, { status: 400 });
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    return NextResponse.json({ wished: !!wishlist });
  } catch (error) {
    console.error("찜 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 찜하기 토글
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId가 필요합니다." }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ wished: false });
    } else {
      await prisma.wishlist.create({
        data: { userId: session.user.id, productId },
      });
      return NextResponse.json({ wished: true });
    }
  } catch (error) {
    console.error("찜하기 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}