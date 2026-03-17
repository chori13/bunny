# 찜하기 테이블 스키마 (Wishlist)

| 컬럼명    | 타입     | 제약조건                  | 설명       |
|-----------|----------|--------------------------|-----------|
| id        | String   | PK, default: cuid()      | 고유 식별자 |
| userId    | String   | FK, NOT NULL             | 회원 ID    |
| productId | String   | FK, NOT NULL             | 상품 ID    |
| createdAt | DateTime | NOT NULL, default: now() | 생성일시    |

## 관계

| 대상 테이블 | 관계   | 삭제 정책  | 설명      |
|------------|--------|-----------|----------|
| User       | N : 1  | CASCADE   | 찜한 회원  |
| Product    | N : 1  | CASCADE   | 찜한 상품  |

## 유니크 제약

- `(userId, productId)` — 같은 상품을 중복 찜 불가