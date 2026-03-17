# 인증 API

## POST /api/auth/signup

회원가입

### Request Body (JSON)

| 필드     | 타입   | 필수 | 설명              |
|----------|--------|------|------------------|
| username | string | O    | 아이디            |
| password | string | O    | 비밀번호 (6자 이상) |

### Response

**201 Created**
```json
{ "message": "회원가입이 완료되었습니다.", "userId": "cuid..." }
```

**400 Bad Request**
```json
{ "error": "아이디와 비밀번호를 입력해주세요." }
{ "error": "비밀번호는 6자 이상이어야 합니다." }
```

**409 Conflict**
```json
{ "error": "이미 사용 중인 아이디입니다." }
```

---

## 로그인 / 로그아웃

NextAuth.js 핸들러를 통해 처리됩니다.

- **POST** `/api/auth/callback/credentials` — 로그인
- **POST** `/api/auth/signout` — 로그아웃
- **GET** `/api/auth/session` — 세션 조회

### 세션 객체

```json
{
  "user": {
    "id": "cuid...",
    "name": "username",
    "role": "USER | ADMIN"
  }
}
```