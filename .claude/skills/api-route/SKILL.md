---
name: api-route
description: "Next.js API 라우트를 프로젝트 패턴에 맞춰 자동 생성합니다. /api-route 명령어나 'API 만들어줘', 'API 라우트 생성', '엔드포인트 추가' 등의 요청 시 트리거됩니다. 새로운 API 엔드포인트를 만들 때 사용합니다."
---

# API Route Generator

이 프로젝트(반려토끼 홈페이지)의 패턴에 맞는 Next.js API 라우트를 생성하는 스킬입니다.

## 프로젝트 컨텍스트

- **프레임워크**: Next.js 16 App Router
- **ORM**: Prisma 7 (PostgreSQL)
- **인증**: NextAuth 5 (`auth()` 함수로 서버사이드 인증)
- **DB 인스턴스**: `@/lib/db`의 `prisma` 싱글턴
- **파일 업로드**: FormData + `fs/promises`로 `/public/uploads/`에 저장

## 워크플로우

### 1단계: 요구사항 확인

사용자에게 다음을 확인합니다 (이미 제공된 정보는 생략):

- **리소스 이름**: 복수형 소문자 (예: products, events, orders)
- **HTTP 메서드**: GET, POST, PUT, DELETE 중 필요한 것
- **인증 필요 여부**: 로그인 필수인지, 관리자 전용인지
- **파일 업로드 여부**: 이미지 등 파일 업로드가 필요한지
- **동적 라우트 필요 여부**: `[id]` 파라미터가 필요한지

### 2단계: 파일 생성

#### 목록/생성 라우트: `src/app/api/{resource}/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: 목록 조회
export async function GET() {
  try {
    const items = await prisma.{model}.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "{리소스} 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 생성 (인증 필요시)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const item = await prisma.{model}.create({ data: { ...body } });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "{리소스} 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
```

#### 상세/수정/삭제 라우트: `src/app/api/{resource}/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET: 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const item = await prisma.{model}.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "{리소스}를 찾을 수 없습니다." }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "조회에 실패했습니다." }, { status: 500 });
  }
}

// PUT: 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const item = await prisma.{model}.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
}

// DELETE: 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    await prisma.{model}.delete({ where: { id } });
    return NextResponse.json({ message: "삭제되었습니다." });
  } catch (error) {
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }
}
```

### 패턴 규칙

- **파일 위치**: `src/app/api/{resource}/route.ts` (목록) / `src/app/api/{resource}/[id]/route.ts` (상세)
- **응답**: 항상 `NextResponse.json()` 사용
- **에러 메시지**: 한국어로 작성
- **동적 params**: `{ params }: { params: Promise<{ id: string }> }` — 반드시 `await params`
- **인증 체크**: `const session = await auth()` → `session?.user` 확인
- **관리자 체크**: `session?.user?.role !== "ADMIN"` 시 403 반환
- **파일 업로드 처리**:
  - `const formData = await request.formData()`
  - 파일명: `Date.now()-{originalName}` 형식
  - 저장 경로: `/public/uploads/`
  - DB에는 `/uploads/{filename}` 저장

### 3단계: 확인

- 생성된 파일 경로와 엔드포인트 URL을 안내합니다
- Prisma 모델이 아직 없으면 `/db-migrate` 스킬 사용을 안내합니다

## 주의사항

- 기존 API 라우트와 경로 충돌 확인
- Prisma 모델이 schema.prisma에 존재하는지 확인
- 파일 업로드 시 `/public/uploads/` 디렉토리 존재 여부 확인
