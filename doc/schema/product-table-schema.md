# 상품 테이블 스키마 (Product)

| 컬럼명    | 타입     | 제약조건                   | 설명       |
|-----------|----------|---------------------------|-----------|
| id        | String   | PK, default: cuid()       | 고유 식별자 |
| name      | String   | NOT NULL                  | 상품명     |
| image     | String   | NULL 허용                  | 첨부파일   |
| price     | Int      | NOT NULL                  | 가격       |
| remarks   | String   | NULL 허용                  | 비고       |
| createdAt | DateTime | NOT NULL, default: now()  | 생성일시   |

## 관계

| 대상 테이블 | 관계   | 설명          |
|------------|--------|--------------|
| OrderItem  | 1 : N  | 주문 상품 목록 |
| Review     | 1 : N  | 리뷰 목록     |
| CartItem   | 1 : N  | 장바구니 목록  |

## 관련 기능
- [상품 등록 명세](../spec/product-register.md)
- [상품 목록 명세](../spec/product-list.md)
- [상품 상세 명세](../spec/product-detail.md)
- [상품 수정 명세](../spec/product-edit.md)