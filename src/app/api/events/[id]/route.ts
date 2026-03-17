import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 이벤트 단건 조회
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      return NextResponse.json({ error: "이벤트를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("이벤트 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 이벤트 수정 (관리자만)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, desc, period, icon, color, status } = body;

    if (!title || !desc || !period || !icon) {
      return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: { title, desc, period, icon, color: color || null, status: status || "ACTIVE" },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("이벤트 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 이벤트 삭제 (관리자만)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("이벤트 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
