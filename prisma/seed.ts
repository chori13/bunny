import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const sampleUsers = [
  { name: "김민수", email: "minsu.kim@example.com", role: "USER" as const },
  { name: "이서연", email: "seoyeon.lee@example.com", role: "USER" as const },
  { name: "박지훈", email: "jihoon.park@example.com", role: "USER" as const },
  { name: "최유진", email: "yujin.choi@example.com", role: "USER" as const },
  { name: "정하은", email: "haeun.jung@example.com", role: "USER" as const },
  { name: "강도윤", email: "doyun.kang@example.com", role: "USER" as const },
  { name: "조수빈", email: "subin.jo@example.com", role: "USER" as const },
  { name: "윤채원", email: "chaewon.yoon@example.com", role: "USER" as const },
  { name: "임재현", email: "jaehyun.lim@example.com", role: "USER" as const },
  { name: "한소율", email: "soyul.han@example.com", role: "USER" as const },
];

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const user of sampleUsers) {
    const existing = await prisma.user.findUnique({ where: { name: user.name } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        },
      });
      console.log(`생성됨: ${user.name} (${user.email})`);
    } else {
      console.log(`이미 존재: ${user.name}`);
    }
  }

  console.log("시드 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());