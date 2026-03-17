import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 이벤트 목록 조회
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("이벤트 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 이벤트 등록 (관리자만)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const body = await req.json();
    const { title, desc, period, icon, color, status } = body;

    if (!title || !desc || !period || !icon) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: { title, desc, period, icon, color: color || null, status: status || "ACTIVE" },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("이벤트 등록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
