import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchYahoo } from "@/lib/stock/yahoo";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const query = req.nextUrl.searchParams.get("q");
    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchYahoo(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("[API] /api/admin/stocks/search GET error:", error);
    return NextResponse.json(
      { error: "검색 실패", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
