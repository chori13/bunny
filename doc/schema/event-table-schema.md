# 이벤트 테이블 스키마 (Event)

| 컬럼명    | 타입        | 제약조건                    | 설명                          |
|-----------|-------------|----------------------------|-------------------------------|
| id        | String      | PK, default: cuid()        | 고유 식별자                    |
| title     | String      | NOT NULL                   | 이벤트 제목                    |
| desc      | String      | NOT NULL                   | 이벤트 설명                    |
| period    | String      | NOT NULL                   | 이벤트 기간                    |
| icon      | String      | NOT NULL                   | 이벤트 아이콘 (이모지)          |
| color     | String      | NULLABLE                   | 카드 색상 (violet, emerald 등) |
| status    | EventStatus | NOT NULL, default: ACTIVE  | 상태 (ACTIVE/UPCOMING/ENDED)  |
| createdAt | DateTime    | NOT NULL, default: now()   | 생성일시                       |
| updatedAt | DateTime    | NOT NULL, @updatedAt       | 수정일시                       |

## EventStatus (Enum)

| 값       | 설명       |
|----------|-----------|
| ACTIVE   | 진행중     |
| UPCOMING | 예정       |
| ENDED    | 종료       |

## 관련 기능
- [이벤트 관리 명세](../spec/event-manage.md)
- [이벤트 목록 명세](../spec/event-list.md)
