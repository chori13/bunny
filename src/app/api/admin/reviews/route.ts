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
    const rating = url.searchParams.get("rating") || "";
    const sort = url.searchParams.get("sort") || "latest";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = 20;

    // Where 조건
    const where: Record<string, unknown> = {};
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        where.rating = ratingNum;
      }
    }
    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // 정렬
    let orderBy: Record<string, unknown> = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    else if (sort === "rating_high") orderBy = { rating: "desc" };
    else if (sort === "rating_low") orderBy = { rating: "asc" };

    const [reviews, total, ratingCounts] = await Promise.all([
      prisma.review.findMany({
        where: where as never,
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, image: true } },
        },
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: where as never }),
      Promise.all(
        [1, 2, 3, 4, 5].map(async (r) => ({
          rating: r,
          count: await prisma.review.count({ where: { rating: r } }),
        }))
      ),
    ]);

    const totalReviews = ratingCounts.reduce((a, b) => a + b.count, 0);
    const avgRating =
      totalReviews > 0
        ? ratingCounts.reduce((a, b) => a + b.rating * b.count, 0) / totalReviews
        : 0;

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      ratingCounts: ratingCounts.reduce(
        (acc, { rating: r, count }) => ({ ...acc, [r]: count }),
        {} as Record<number, number>
      ),
      totalReviews,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error("리뷰 목록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
