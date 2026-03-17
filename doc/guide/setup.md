# 개발 환경 설정 가이드

## 사전 요구사항

- Node.js 20+
- Docker (PostgreSQL용)
- Git

## 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd bunny
npm install
```

## 2. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
DATABASE_URL="postgresql://myapp:myapp1234@localhost:5432/bunny"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
AUTH_SECRET="your-secret-key-here"
```

## 3. PostgreSQL (Docker)

```bash
# 컨테이너 실행
docker run --name myapp-postgres \
  -e POSTGRES_USER=myapp \
  -e POSTGRES_PASSWORD=myapp1234 \
  -e POSTGRES_DB=bunny \
  -p 5432:5432 \
  -d postgres:latest

# 컨테이너 시작 (이미 생성된 경우)
docker start myapp-postgres
```

## 4. 데이터베이스 초기화

```bash
# 스키마를 DB에 반영
npx prisma db push

# Prisma Client 생성
npx prisma generate
```

## 5. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

## 6. 관리자 계정

- 아이디: `owall`
- 역할: ADMIN
- 회원가입 후 DB에서 직접 role을 ADMIN으로 변경하거나, 이미 생성된 계정 사용

```sql
UPDATE "User" SET role = 'ADMIN' WHERE username = 'owall';
```

## 주요 명령어

| 명령어               | 설명                       |
|---------------------|---------------------------|
| `npm run dev`       | 개발 서버 실행              |
| `npm run build`     | 프로덕션 빌드              |
| `npm run lint`      | ESLint 코드 검사           |
| `npx prisma studio` | Prisma Studio (DB 관리 UI) |
| `npx prisma db push` | 스키마 변경 반영            |
| `npx prisma generate` | Prisma Client 재생성      |