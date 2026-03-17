import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function buildEmailHtml(title: string, content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">공지사항</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <h2 style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:600">${title}</h2>
          <div style="color:#52525b;font-size:15px;line-height:1.7;white-space:pre-wrap">${content}</div>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #f4f4f5">
          <p style="margin:0;color:#a1a1aa;font-size:12px;text-align:center">본 메일은 발신 전용입니다.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { noticeId, userIds } = await req.json();

    if (!noticeId || !userIds?.length) {
      return NextResponse.json({ error: "공지사항과 발송 대상을 선택해주세요." }, { status: 400 });
    }

    const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!notice) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpConfigured = !!smtpUser && !!smtpPass;

    console.log(`[이메일] SMTP 설정 상태: ${smtpConfigured ? "설정됨" : "미설정"} (USER: ${smtpUser ? smtpUser : "없음"})`);

    // SMTP 연결 테스트
    let transporter: nodemailer.Transporter | null = null;
    if (smtpConfigured) {
      transporter = createTransporter();
      try {
        await transporter.verify();
        console.log("[이메일] SMTP 연결 성공");
      } catch (verifyErr) {
        console.error("[이메일] SMTP 연결 실패:", verifyErr);
        const errMsg = verifyErr instanceof Error ? verifyErr.message : "알 수 없는 오류";
        return NextResponse.json({
          error: `SMTP 연결 실패: ${errMsg}`,
          hint: "SMTP_USER, SMTP_PASS 설정을 확인해주세요. Gmail의 경우 앱 비밀번호가 필요합니다.",
        }, { status: 500 });
      }
    }

    const results = {
      total: users.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [] as { name: string; email: string | null; status: string }[],
    };

    const html = buildEmailHtml(notice.title, notice.content);
    const from = process.env.SMTP_FROM || smtpUser;

    for (const user of users) {
      if (!user.email) {
        results.skipped++;
        results.details.push({ name: user.name, email: null, status: "이메일 미등록 - 건너뜀" });
        continue;
      }

      if (!smtpConfigured || !transporter) {
        console.log(`[이메일 시뮬레이션] To: ${user.email} | 제목: ${notice.title}`);
        results.sent++;
        results.details.push({ name: user.name, email: user.email, status: "발송 완료 (시뮬레이션)" });
        continue;
      }

      try {
        await transporter.sendMail({
          from,
          to: user.email,
          subject: `[공지] ${notice.title}`,
          html,
        });
        console.log(`[이메일] 발송 성공: ${user.email}`);
        results.sent++;
        results.details.push({ name: user.name, email: user.email, status: "발송 완료" });
      } catch (err) {
        console.error(`[이메일] 발송 실패 (${user.email}):`, err);
        results.failed++;
        results.details.push({
          name: user.name,
          email: user.email,
          status: `발송 실패: ${err instanceof Error ? err.message : "알 수 없는 오류"}`,
        });
      }
    }

    const statusParts = [`${results.sent}명 발송 완료`];
    if (results.failed > 0) statusParts.push(`${results.failed}명 실패`);
    if (results.skipped > 0) statusParts.push(`${results.skipped}명 건너뜀`);
    if (!smtpConfigured) statusParts.push("(SMTP 미설정 - 시뮬레이션 모드)");

    return NextResponse.json({ message: statusParts.join(", "), ...results });
  } catch (error) {
    console.error("이메일 발송 오류:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json({ error: `서버 오류: ${message}` }, { status: 500 });
  }
}