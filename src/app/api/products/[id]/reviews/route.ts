import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 상품별 리뷰 목록 조회
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const [reviews, totalCount, ratingAgg] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId: id } }),
      prisma.review.aggregate({
        where: { productId: id },
        _avg: { rating: true },
      }),
    ]);

    const avgRating = ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 10) / 10
      : 0;

    return NextResponse.json({
      reviews,
      avgRating,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 리뷰 작성
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const { rating, content } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "평점을 선택해주세요. (1~5)" }, { status: 400 });
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
    }

    // 중복 리뷰 확인
    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, productId: id },
    });
    if (existing) {
      return NextResponse.json({ error: "이미 리뷰를 작성하셨습니다." }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: id,
        rating,
        content: content?.trim() || null,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("리뷰 작성 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
