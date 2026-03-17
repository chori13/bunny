# 공지사항 테이블 스키마 (Notice)

| 컬럼명    | 타입        | 제약조건                      | 설명       |
|-----------|-------------|------------------------------|-----------|
| id        | String      | PK, default: cuid()          | 고유 식별자 |
| title     | String      | NOT NULL                     | 제목       |
| content   | String      | NOT NULL                     | 내용       |
| type      | NoticeType  | NOT NULL, default: GENERAL   | 공지 유형   |
| isActive  | Boolean     | NOT NULL, default: true      | 활성 여부   |
| createdAt | DateTime    | NOT NULL, default: now()     | 생성일시    |
| updatedAt | DateTime    | NOT NULL, @updatedAt         | 수정일시    |

## Enum: NoticeType

| 값      | 설명          |
|---------|--------------|
| GENERAL | 일반 공지사항  |
| POPUP   | 팝업 공지사항  |
| EMAIL   | 이메일 공지사항 |