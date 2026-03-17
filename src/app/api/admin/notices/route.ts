import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 공지사항 목록
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error("공지사항 목록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 공지사항 등록
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { title, content, type, isActive } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type: type || "GENERAL",
        isActive: isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error("공지사항 등록 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
