# Bunny Shop 문서

토끼 용품 전문 쇼핑몰 프로젝트 문서입니다.

## 문서 구조

### 📋 spec/ — 기능 명세

화면 구성과 동작 흐름을 정의합니다.

| 파일 | 설명 |
|------|------|
| [signup.md](spec/signup.md) | 회원가입 |
| [login.md](spec/login.md) | 로그인 |
| [mypage.md](spec/mypage.md) | 마이페이지 |
| [product-register.md](spec/product-register.md) | 상품 등록 |
| [product-list.md](spec/product-list.md) | 상품 목록 |
| [product-detail.md](spec/product-detail.md) | 상품 상세 |
| [product-edit.md](spec/product-edit.md) | 상품 수정 |
| [event-list.md](spec/event-list.md) | 이벤트 목록 |
| [event-manage.md](spec/event-manage.md) | 이벤트 관리 |
| [guide.md](spec/guide.md) | 건강 가이드 |

### 🗄️ schema/ — 테이블 스키마

데이터베이스 테이블 구조를 정의합니다.

| 파일 | 테이블 |
|------|--------|
| [user-table-schema.md](schema/user-table-schema.md) | User (회원) |
| [product-table-schema.md](schema/product-table-schema.md) | Product (상품) |
| [event-table-schema.md](schema/event-table-schema.md) | Event (이벤트) |
| [cart-item-table-schema.md](schema/cart-item-table-schema.md) | CartItem (장바구니) |
| [order-table-schema.md](schema/order-table-schema.md) | Order (주문) |
| [order-item-table-schema.md](schema/order-item-table-schema.md) | OrderItem (주문 상품) |
| [review-table-schema.md](schema/review-table-schema.md) | Review (리뷰) |

### 🔌 api/ — API 레퍼런스

REST API 엔드포인트 명세입니다.

| 파일 | 설명 |
|------|------|
| [README.md](api/README.md) | 전체 엔드포인트 요약 |
| [auth.md](api/auth.md) | 인증 API |
| [products.md](api/products.md) | 상품 API |
| [events.md](api/events.md) | 이벤트 API |

### 📖 guide/ — 개발 가이드

개발 환경 설정 및 프로젝트 이해를 돕는 문서입니다.

| 파일 | 설명 |
|------|------|
| [setup.md](guide/setup.md) | 개발 환경 설정 |
| [architecture.md](guide/architecture.md) | 프로젝트 아키텍처 |
| [pages.md](guide/pages.md) | 페이지 맵 |