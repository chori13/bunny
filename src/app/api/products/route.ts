import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const remarks = formData.get("remarks") as string | null;
    const file = formData.get("image") as File | null;

    if (!name || !price) {
      return NextResponse.json(
        { error: "상품명과 가격을 입력해주세요." },
        { status: 400 }
      );
    }

    let imagePath: string | null = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);
      await writeFile(uploadPath, buffer);
      imagePath = `/uploads/${fileName}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        remarks: remarks || null,
        image: imagePath,
      },
    });

    return NextResponse.json(
      { message: "상품이 등록되었습니다.", productId: product.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
