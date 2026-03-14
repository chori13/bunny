# 장바구니 테이블 스키마 (CartItem)

| 컬럼명    | 타입   | 제약조건              | 설명       |
|-----------|--------|-----------------------|-----------|
| id        | String | PK, default: cuid()   | 고유 식별자 |
| userId    | String | FK, NOT NULL          | 회원 ID    |
| productId | String | FK, NOT NULL          | 상품 ID    |
| quantity  | Int    | NOT NULL, default: 1  | 수량       |

## 제약조건

| 유형   | 컬럼                   | 설명                    |
|--------|------------------------|------------------------|
| UNIQUE | userId + productId     | 회원당 동일 상품 중복 방지 |

## 관계

| 대상 테이블 | 관계   | 삭제 정책        | 설명     |
|------------|--------|-----------------|---------|
| User       | N : 1  | CASCADE         | 소속 회원 |
| Product    | N : 1  | CASCADE         | 대상 상품 |
