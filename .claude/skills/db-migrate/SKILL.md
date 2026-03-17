---
name: db-migrate
description: "Prisma 스키마 변경 + 마이그레이션 + 스키마 문서 자동 업데이트를 한번에 처리합니다. /db-migrate 명령어나 '테이블 추가', '모델 수정', 'DB 스키마 변경', '컬럼 추가' 등의 요청 시 트리거됩니다. 데이터베이스 구조를 변경할 때 사용합니다."
---

# DB Migrate

Prisma 스키마 변경, 마이그레이션 실행, 스키마 문서 업데이트를 한번에 처리하는 스킬입니다.

## 프로젝트 컨텍스트

- **ORM**: Prisma 7
- **DB**: PostgreSQL (@prisma/adapter-pg)
- **스키마 파일**: `prisma/schema.prisma`
- **생성 경로**: `src/generated/prisma`
- **문서 경로**: `doc/schema/{model}-table-schema.md`
- **ID 전략**: `@id @default(cuid())`
- **타임스탬프**: `createdAt @default(now())`, `updatedAt @updatedAt`

## 워크플로우

### 1단계: 요구사항 확인

사용자에게 다음을 확인합니다:

- **작업 유형**: 새 모델 추가 / 기존 모델 수정 / 모델 삭제
- **모델 이름**: PascalCase (예: Product, CartItem)
- **필드 목록**: 이름, 타입, 제약조건
- **관계**: 다른 모델과의 관계 (1:N, N:M 등)
- **Enum 필요 여부**: 상태값 등 열거형이 필요한지

### 2단계: Prisma 스키마 수정

`prisma/schema.prisma` 파일을 수정합니다.

#### 모델 작성 규칙

```prisma
model ModelName {
  id        String   @id @default(cuid())
  // 필드들...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 관계
  userId  String
  user    User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### 패턴 규칙

- **ID**: `String @id @default(cuid())` 사용
- **타임스탬프**: `createdAt`은 `@default(now())`, `updatedAt`은 `@updatedAt`
- **외래키 삭제 정책**: 부모-자식 관계는 `onDelete: Cascade`
- **유니크 제약**: `@@unique([field1, field2])` 형태
- **Enum**: 모델 외부에 별도 정의
- **nullable**: 선택적 필드는 `String?` 형태

### 3단계: 마이그레이션 실행

```bash
npx prisma migrate dev --name {변경_내용_요약}
```

마이그레이션 이름은 snake_case 영문으로 작성합니다.
예: `add_review_model`, `add_status_to_order`, `remove_legacy_fields`

마이그레이션이 실패하면:
1. 에러 메시지를 분석합니다
2. 스키마를 수정합니다
3. 다시 실행합니다

### 4단계: 스키마 문서 업데이트

`doc/schema/{model-name}-table-schema.md` 파일을 생성하거나 업데이트합니다.
모델명은 kebab-case로 변환합니다 (예: CartItem → cart-item).

#### 문서 템플릿

```markdown
# {ModelName} 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
| --- | --- | --- | --- |
| id | String | PK, cuid() | 고유 식별자 |
| ... | ... | ... | ... |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

## Enum (해당시)

### {EnumName}

| 값 | 설명 |
| --- | --- |
| VALUE | 설명 |

## 관계

| 대상 테이블 | 관계 | 설명 |
| --- | --- | --- |
| User | N:1 | 작성자 |

## 관련 기능

- [기능명](../spec/feature.md)
```

#### 문서 규칙

- Prisma 스키마의 모든 필드를 빠짐없이 문서화
- 타입은 Prisma 타입 그대로 (String, Int, DateTime 등)
- 제약조건에 PK, FK, unique, nullable, default값 명시
- 설명은 한국어로 작성
- Enum이 있으면 별도 섹션으로 분리
- 관계는 대상 테이블과 관계 타입(1:N, N:1, N:M) 명시
- 관련 기능 스펙이 있으면 링크 추가

### 5단계: 완료 확인

- 변경된 파일 목록을 사용자에게 알려줍니다:
  - `prisma/schema.prisma`
  - `doc/schema/{model}-table-schema.md`
  - 마이그레이션 파일
- 관련 API 라우트가 필요하면 `/api-route` 스킬 사용을 안내합니다

## 주의사항

- 기존 데이터가 있는 테이블의 NOT NULL 컬럼 추가 시 default 값 필요
- 관계 변경 시 양쪽 모델 모두 업데이트
- 마이그레이션 전 `prisma/schema.prisma` 문법 검증 (`npx prisma validate`)
- 프로덕션 DB에 직접 마이그레이션 금지 — dev 환경에서만 실행
