import { prisma } from "@/lib/db";

interface AuditLogParams {
  action: string;
  targetType: string;
  targetId: string;
  detail?: Record<string, unknown>;
  adminId: string;
  adminName: string;
}

export async function createAuditLog({
  action,
  targetType,
  targetId,
  detail,
  adminId,
  adminName,
}: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        targetType,
        targetId,
        detail: detail ? JSON.stringify(detail) : null,
        adminId,
        adminName,
      },
    });
  } catch (error) {
    // 감사 로그 실패가 원래 작업을 중단시키면 안됨
    console.error("감사 로그 생성 실패:", error);
  }
}
