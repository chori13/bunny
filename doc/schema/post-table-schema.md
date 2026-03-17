# 게시글 테이블 스키마 (Post)

| 컬럼명    | 타입     | 제약조건                  | 설명       |
|-----------|----------|--------------------------|-----------|
| id        | String   | PK, default: cuid()      | 고유 식별자 |
| title     | String   | NOT NULL                 | 제목       |
| content   | String   | NOT NULL                 | 내용       |
| userId    | String   | FK, NOT NULL             | 작성자 ID  |
| createdAt | DateTime | NOT NULL, default: now() | 생성일시    |
| updatedAt | DateTime | NOT NULL, @updatedAt     | 수정일시    |

## 관계

| 대상 테이블 | 관계   | 삭제 정책  | 설명       |
|------------|--------|-----------|-----------|
| User       | N : 1  | CASCADE   | 작성 회원   |
| Comment    | 1 : N  | CASCADE   | 게시글 댓글 |