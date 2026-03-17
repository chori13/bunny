# AuditLog 테이블 스키마

## 모델 정의

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String   // ORDER_STATUS_CHANGE, USER_ROLE_CHANGE, REVIEW_DELETE, etc.
  targetType String   // Order, User, Review, Product, Event, Notice
  targetId   String
  detail     String?  // JSON string with before/after or extra info
  adminId    String
  adminName  String
  createdAt  DateTime @default(now())

  @@index([action])
  @@index([targetType])
  @@index([createdAt])
}
```

## 컬럼 설명

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | String | O | PK, cuid 자동 생성 |
| action | String | O | 액션 유형 (ORDER_STATUS_CHANGE, USER_ROLE_CHANGE, REVIEW_DELETE 등) |
| targetType | String | O | 대상 모델명 (Order, User, Review, Product, Event, Notice) |
| targetId | String | O | 대상 레코드 ID |
| detail | String | X | 변경 상세 정보 (JSON 문자열) |
| adminId | String | O | 실행한 관리자 ID |
| adminName | String | O | 실행한 관리자 이름 |
| createdAt | DateTime | O | 생성 시각 (자동) |

## 인덱스

- `@@index([action])` — 액션 유형별 빠른 조회
- `@@index([targetType])` — 대상 유형별 빠른 조회
- `@@index([createdAt])` — 시간순 정렬 최적화

## 관련 API

- `GET /api/admin/audit-logs` — 감사 로그 목록 (필터/검색/페이지네이션)
- `POST` via `createAuditLog()` 헬퍼 — 관리자 액션 실행 시 자동 기록

## 감사 대상 액션

| 액션 | 설명 | 기록 시점 |
|------|------|-----------|
| ORDER_STATUS_CHANGE | 주문 상태 변경 | PUT /api/admin/orders/[id] |
| USER_ROLE_CHANGE | 회원 역할 변경 | PUT /api/admin/users/[id] |
| REVIEW_DELETE | 리뷰 삭제 | DELETE /api/admin/reviews/[id] |
