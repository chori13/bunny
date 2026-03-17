import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings, setSetting } from "@/lib/site-settings";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const settings = await getAllSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("설정 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const body = await req.json();

    // 허용된 키만 업데이트
    const allowedKeys = [
      "siteName",
      "siteDescription",
      "contactEmail",
      "contactPhone",
      "contactAddress",
      "freeShippingThreshold",
      "footerCopyright",
      "maintenanceMode",
      "announcement",
    ];

    const changes: Record<string, unknown> = {};

    for (const key of allowedKeys) {
      if (key in body) {
        await setSetting(key, body[key]);
        changes[key] = body[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        action: "SITE_SETTINGS_UPDATE",
        targetType: "SiteSetting",
        targetId: "global",
        detail: { changed: Object.keys(changes) },
        adminId: session.user.id,
        adminName: session.user.name || "관리자",
      });
    }

    const updated = await getAllSettings();
    return NextResponse.json({ message: "설정이 저장되었습니다.", settings: updated });
  } catch (error) {
    console.error("설정 저장 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
