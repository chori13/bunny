import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

// 배송 주소 조회 (쿠키 기반 - DB 스키마 변경 없이)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const cookieStore = await cookies();
    const addressData = cookieStore.get(`address_${session.user.id}`);
    if (!addressData) {
      return NextResponse.json({ addresses: [] });
    }

    try {
      const addresses = JSON.parse(addressData.value);
      return NextResponse.json({ addresses });
    } catch {
      return NextResponse.json({ addresses: [] });
    }
  } catch (error) {
    console.error("주소 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 배송 주소 저장
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { recipientName, phone, address, memo, isDefault } = await req.json();

    if (!recipientName?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json({ error: "수령인, 연락처, 주소를 입력해주세요." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const existing = cookieStore.get(`address_${session.user.id}`);
    let addresses: Array<{
      id: string;
      recipientName: string;
      phone: string;
      address: string;
      memo: string;
      isDefault: boolean;
    }> = [];

    if (existing) {
      try {
        addresses = JSON.parse(existing.value);
      } catch {
        addresses = [];
      }
    }

    const newAddress = {
      id: `addr_${Date.now()}`,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      memo: memo?.trim() || "",
      isDefault: isDefault || addresses.length === 0,
    };

    if (newAddress.isDefault) {
      addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    }

    addresses.push(newAddress);

    cookieStore.set(`address_${session.user.id}`, JSON.stringify(addresses), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("주소 저장 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// 배송 주소 삭제
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await req.json();
    const cookieStore = await cookies();
    const existing = cookieStore.get(`address_${session.user.id}`);

    if (!existing) {
      return NextResponse.json({ error: "주소를 찾을 수 없습니다." }, { status: 404 });
    }

    let addresses = JSON.parse(existing.value);
    addresses = addresses.filter((a: { id: string }) => a.id !== id);

    cookieStore.set(`address_${session.user.id}`, JSON.stringify(addresses), {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
    });

    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    console.error("주소 삭제 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
