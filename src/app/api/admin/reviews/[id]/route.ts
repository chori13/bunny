import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// 리뷰 상세 조회
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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, image: true, price: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("리뷰 상세 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 리뷰 삭제 (관리자)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.review.delete({ where: { id } });

    await createAuditLog({
      action: "REVIEW_DELETE",
      targetType: "Review",
      targetId: id,
      detail: { userId: review.userId, productId: review.productId, rating: review.rating },
      adminId: session.user.id,
      adminName: session.user.name || "관리자",
    });

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
