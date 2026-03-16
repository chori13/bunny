import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchUnifiedStockData } from "@/lib/stock/merge";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const symbol = req.nextUrl.searchParams.get("symbol");
    const period = req.nextUrl.searchParams.get("period") || "1y";

    if (!symbol) {
      return NextResponse.json({ error: "symbol 파라미터가 필요합니다." }, { status: 400 });
    }

    const data = await fetchUnifiedStockData(symbol.toUpperCase(), period);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /api/admin/stocks GET error:", error);
    return NextResponse.json(
      { error: "주식 데이터 조회 실패", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}