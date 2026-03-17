# 댓글 테이블 스키마 (Comment)

| 컬럼명    | 타입     | 제약조건                  | 설명       |
|-----------|----------|--------------------------|-----------|
| id        | String   | PK, default: cuid()      | 고유 식별자 |
| content   | String   | NOT NULL                 | 댓글 내용   |
| userId    | String   | FK, NOT NULL             | 작성자 ID  |
| postId    | String   | FK, NOT NULL             | 게시글 ID  |
| createdAt | DateTime | NOT NULL, default: now() | 생성일시    |

## 관계

| 대상 테이블 | 관계   | 삭제 정책  | 설명      |
|------------|--------|-----------|----------|
| User       | N : 1  | CASCADE   | 작성 회원  |
| Post       | N : 1  | CASCADE   | 대상 게시글 |