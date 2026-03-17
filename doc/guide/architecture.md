# 프로젝트 아키텍처

## 기술 스택

| 구분       | 기술                              |
|-----------|----------------------------------|
| 프레임워크  | Next.js 16 (App Router)          |
| 언어       | TypeScript                       |
| 스타일     | Tailwind CSS v4                  |
| 데이터베이스 | PostgreSQL (Docker)             |
| ORM       | Prisma 7 (@prisma/adapter-pg)    |
| 인증       | NextAuth.js v5 (JWT 전략)        |
| 상태관리   | Zustand (장바구니)                |
| 아이콘     | Lucide React                     |
| 결제       | PortOne SDK (예정)               |

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/                # API Route Handlers
│   │   ├── auth/           # 인증 (회원가입, NextAuth)
│   │   ├── events/         # 이벤트 CRUD
│   │   ├── orders/         # 주문 (예정)
│   │   └── products/       # 상품 CRUD
│   ├── cart/               # 장바구니 페이지
│   ├── events/             # 이벤트 목록 + 관리
│   ├── guide/              # 건강 가이드
│   ├── login/              # 로그인
│   ├── mypage/             # 마이페이지
│   ├── products/           # 상품 목록 + 상세 + 등록 + 수정
│   ├── signup/             # 회원가입
│   ├── globals.css         # 전역 스타일 (다크 테마)
│   ├── layout.tsx          # 루트 레이아웃
│   └── page.tsx            # 메인 페이지
├── components/             # 공통 컴포넌트
│   ├── AuthProvider.tsx    # NextAuth SessionProvider 래퍼
│   ├── Header.tsx          # 네비게이션 헤더
│   ├── Footer.tsx          # 푸터
│   └── ScrollReveal.tsx    # 스크롤 애니메이션 래퍼
├── generated/prisma/       # Prisma 자동 생성 코드
├── hooks/                  # 커스텀 훅
│   └── useScrollReveal.ts  # 스크롤 노출 감지
├── lib/                    # 유틸리티
│   ├── auth.ts             # NextAuth 설정
│   └── db.ts               # Prisma 싱글턴 클라이언트
├── store/                  # Zustand 스토어
│   └── cart.ts             # 장바구니 상태 관리
└── types/                  # 타입 정의
    └── next-auth.d.ts      # NextAuth 세션 타입 확장
```

## 인증 흐름

```
사용자 → 로그인 폼 → NextAuth Credentials Provider
  → DB에서 username 조회 → bcrypt 비밀번호 비교
  → JWT 토큰 발급 (id, role 포함)
  → 세션에 id, role 노출
```

## 역할 기반 접근 제어

| 기능           | USER | ADMIN |
|---------------|:----:|:-----:|
| 상품 조회      | O    | O     |
| 상품 등록/수정/삭제 | X | O     |
| 이벤트 조회    | O    | O     |
| 이벤트 관리    | X    | O     |
| 장바구니       | O    | O     |
| 구매하기       | O    | X     |

## 디자인 시스템

- **테마**: 다크 (#0f0f11 배경)
- **스타일**: Glassmorphism (반투명 + blur)
- **주요 색상**: Violet/Indigo 그라디언트
- **CSS 클래스**:
  - `.glass` — 글래스모피즘 카드
  - `.gradient-text` — 바이올렛 그라디언트 텍스트
  - `.btn-gradient` — 그라디언트 버튼
  - `.input-dark` — 다크 입력 필드

## 데이터 모델 관계도

```
User ──┬── Order ──── OrderItem ──── Product
       ├── Review ────────────────── Product
       └── CartItem ─────────────── Product

Event (독립)
```