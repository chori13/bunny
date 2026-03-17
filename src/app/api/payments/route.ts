import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 결제 완료 처리 (포트원 결제 검증)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { paymentId, orderId } = await req.json();

    if (!paymentId || !orderId) {
      return NextResponse.json({ error: "결제 정보가 누락되었습니다." }, { status: 400 });
    }

    // 주문 확인
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "주문을 찾을 수 없습니다." }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "이미 처리된 주문입니다." }, { status: 400 });
    }

    // 포트원 API로 결제 검증
    const portoneSecret = process.env.PORTONE_API_SECRET;
    if (!portoneSecret) {
      // 테스트 모드: 포트원 키가 없으면 검증 스킵
      console.warn("PORTONE_API_SECRET 미설정 - 테스트 모드로 결제 처리");
    } else {
      const verifyRes = await fetch(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: { Authorization: `PortOne ${portoneSecret}` },
        }
      );

      if (!verifyRes.ok) {
        console.error("포트원 결제 조회 실패:", await verifyRes.text());
        return NextResponse.json({ error: "결제 검증에 실패했습니다." }, { status: 400 });
      }

      const payment = await verifyRes.json();

      // 금액 검증
      if (payment.amount?.total !== order.totalAmount) {
        console.error("금액 불일치:", payment.amount?.total, "vs", order.totalAmount);
        return NextResponse.json({ error: "결제 금액이 일치하지 않습니다." }, { status: 400 });
      }

      // 결제 상태 확인
      if (payment.status !== "PAID") {
        return NextResponse.json({ error: "결제가 완료되지 않았습니다." }, { status: 400 });
      }
    }

    // 주문 상태 업데이트
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paymentId },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("결제 검증 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}