# 주문 테이블 스키마 (Order)

| 컬럼명        | 타입        | 제약조건                       | 설명        |
|---------------|-------------|-------------------------------|------------|
| id            | String      | PK, default: cuid()           | 고유 식별자  |
| userId        | String      | FK, NOT NULL                  | 회원 ID     |
| status        | OrderStatus | NOT NULL, default: PENDING    | 주문 상태    |
| totalAmount   | Int         | NOT NULL                      | 총 결제 금액 |
| recipientName | String      | NOT NULL                      | 수령인 이름  |
| phone         | String      | NOT NULL                      | 연락처      |
| address       | String      | NOT NULL                      | 배송 주소    |
| memo          | String      | NULL 허용                      | 배송 메모   |
| paymentId     | String      | NULL 허용                      | 결제 ID    |
| createdAt     | DateTime    | NOT NULL, default: now()      | 생성일시    |
| updatedAt     | DateTime    | NOT NULL, auto                | 수정일시    |

## OrderStatus (Enum)

| 값        | 설명     |
|-----------|---------|
| PENDING   | 주문 대기 |
| PAID      | 결제 완료 |
| SHIPPING  | 배송 중   |
| DELIVERED | 배송 완료 |
| CANCELLED | 주문 취소 |

## 관계

| 대상 테이블 | 관계   | 설명          |
|------------|--------|--------------|
| User       | N : 1  | 주문 회원     |
| OrderItem  | 1 : N  | 주문 상품 목록 |