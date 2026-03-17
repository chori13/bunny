import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const sort = searchParams.get("sort") || "latest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // 검색 조건
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { remarks: { contains: search, mode: "insensitive" } },
      ];
    }

    // 가격 필터
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
    }

    // 정렬
    let orderBy: Record<string, string>;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("상품 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const remarks = formData.get("remarks") as string | null;
    const file = formData.get("image") as File | null;

    if (!name || isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "상품명과 가격을 입력해주세요." },
        { status: 400 }
      );
    }

    let imagePath: string | null = null;

    if (file && file.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)" },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "파일 크기는 5MB 이하만 가능합니다." },
          { status: 400 }
        );
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(uploadDir, fileName);
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
  } catch (error) {
    console.error("상품 등록 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
