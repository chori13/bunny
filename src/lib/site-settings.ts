import { prisma } from "@/lib/db";

// 기본 설정값
export const DEFAULT_SETTINGS: Record<string, unknown> = {
  siteName: "Bunny Shop",
  siteDescription: "건강하고 행복한 토끼를 위한 프리미엄 용품 쇼핑몰",
  contactEmail: "bunnyshop@example.com",
  contactPhone: "02-1234-5678",
  contactAddress: "서울특별시 강남구",
  freeShippingThreshold: 30000,
  footerCopyright: "© 2026 Bunny Shop. All rights reserved.",
  maintenanceMode: false,
  announcement: "",
};

export async function getSetting(key: string): Promise<unknown> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key } });
    if (!setting) return DEFAULT_SETTINGS[key] ?? null;
    return JSON.parse(setting.value);
  } catch {
    return DEFAULT_SETTINGS[key] ?? null;
  }
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  try {
    const settings = await prisma.siteSetting.findMany();
    const result = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    }
    return result;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}
