# 주문 상품 테이블 스키마 (OrderItem)

| 컬럼명    | 타입   | 제약조건              | 설명           |
|-----------|--------|-----------------------|---------------|
| id        | String | PK, default: cuid()   | 고유 식별자     |
| orderId   | String | FK, NOT NULL          | 주문 ID        |
| productId | String | FK, NOT NULL          | 상품 ID        |
| quantity  | Int    | NOT NULL              | 주문 수량       |
| price     | Int    | NOT NULL              | 주문 시점 가격   |

## 관계

| 대상 테이블 | 관계   | 삭제 정책  | 설명      |
|------------|--------|-----------|----------|
| Order      | N : 1  | CASCADE   | 소속 주문  |
| Product    | N : 1  | -         | 대상 상품  |