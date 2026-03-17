import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// 댓글 작성
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
    }

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), userId: session.user.id, postId },
      include: { user: { select: { name: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
