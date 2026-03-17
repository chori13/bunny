import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 게시글 목록 조회
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        _count: { select: { comments: true } },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 게시글 작성
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { title, content } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        id: undefined,
        title: title.trim(),
        content: content.trim(),
        userId: session.user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("게시글 작성 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
