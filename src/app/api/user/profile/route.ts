import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 내 프로필 조회
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 프로필 수정
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { email, currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 비밀번호 변경 요청인 경우
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "현재 비밀번호를 입력해주세요." }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "새 비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
      }
    }

    const updateData: { email?: string | null; password?: string } = {};

    // 이메일 업데이트
    if (email !== undefined) {
      updateData.email = email.trim() || null;
    }

    // 비밀번호 업데이트
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ message: "프로필이 수정되었습니다.", user: updated });
  } catch (error) {
    console.error("프로필 수정 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
