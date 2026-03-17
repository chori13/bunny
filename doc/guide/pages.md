# 페이지 맵

Bunny Shop의 전체 페이지 구성과 라우팅 정보입니다.

## 공개 페이지

| 경로            | 파일                          | 설명          |
|----------------|-------------------------------|--------------|
| `/`            | `src/app/page.tsx`            | 메인 페이지    |
| `/login`       | `src/app/login/page.tsx`      | 로그인        |
| `/signup`      | `src/app/signup/page.tsx`     | 회원가입       |
| `/products`    | `src/app/products/page.tsx`   | 상품 목록      |
| `/products/[id]` | `src/app/products/[id]/page.tsx` | 상품 상세  |
| `/events`      | `src/app/events/page.tsx`     | 이벤트 목록    |
| `/guide`       | `src/app/guide/page.tsx`      | 건강 가이드    |
| `/cart`        | `src/app/cart/page.tsx`       | 장바구니       |

## 로그인 필수 페이지

| 경로            | 파일                          | 설명          |
|----------------|-------------------------------|--------------|
| `/mypage`      | `src/app/mypage/page.tsx`     | 마이페이지     |

## 관리자 전용 페이지

| 경로                     | 파일                                      | 설명         |
|--------------------------|-------------------------------------------|-------------|
| `/products/register`     | `src/app/products/register/page.tsx`      | 상품 등록     |
| `/products/[id]/edit`    | `src/app/products/[id]/edit/page.tsx`     | 상품 수정     |
| `/events/manage`         | `src/app/events/manage/page.tsx`          | 이벤트 관리   |

## 헤더 네비게이션 메뉴

| 메뉴        | 경로         |
|------------|-------------|
| Bunny Shop | `/`         |
| 전체 상품   | `/products` |
| 이벤트     | `/events`   |
| 커뮤니티   | (미구현)     |
| 건강 가이드 | `/guide`    |

## 미구현 페이지 (예정)

| 경로          | 설명         |
|--------------|-------------|
| `/community` | 커뮤니티     |
| `/checkout`  | 결제         |
| `/orders`    | 주문 내역    |
| `/adopt`     | 입양 정보    |
| `/hospital`  | 병원 찾기    |
| `/qna`       | Q&A         |