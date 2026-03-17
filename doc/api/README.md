# API 엔드포인트 레퍼런스

Bunny Shop의 전체 API 엔드포인트 목록입니다.

## 인증 (Auth)

| 메서드 | 경로                         | 권한  | 설명         |
|--------|------------------------------|-------|-------------|
| POST   | `/api/auth/signup`           | 공개  | 회원가입     |
| POST   | `/api/auth/[...nextauth]`    | 공개  | 로그인/로그아웃 |
| GET    | `/api/auth/[...nextauth]`    | 공개  | 세션 조회    |

## 상품 (Products)

| 메서드 | 경로                     | 권한   | 설명        |
|--------|--------------------------|--------|------------|
| GET    | `/api/products`          | 공개   | 상품 목록    |
| POST   | `/api/products`          | 공개   | 상품 등록    |
| GET    | `/api/products/[id]`     | 공개   | 상품 상세    |
| PUT    | `/api/products/[id]`     | ADMIN  | 상품 수정    |
| DELETE | `/api/products/[id]`     | ADMIN  | 상품 삭제    |

## 이벤트 (Events)

| 메서드 | 경로                   | 권한   | 설명        |
|--------|------------------------|--------|------------|
| GET    | `/api/events`          | 공개   | 이벤트 목록  |
| POST   | `/api/events`          | ADMIN  | 이벤트 등록  |
| GET    | `/api/events/[id]`     | 공개   | 이벤트 상세  |
| PUT    | `/api/events/[id]`     | ADMIN  | 이벤트 수정  |
| DELETE | `/api/events/[id]`     | ADMIN  | 이벤트 삭제  |

---

상세 명세는 아래 파일을 참고하세요.

- [인증 API](auth.md)
- [상품 API](products.md)
- [이벤트 API](events.md)