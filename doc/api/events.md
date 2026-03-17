# 이벤트 API

## GET /api/events

전체 이벤트 목록 조회 (최신순)

### Response — 200 OK

```json
[
  {
    "id": "cuid...",
    "title": "신규 회원 가입 이벤트",
    "desc": "회원가입만 해도 첫 구매 10% 할인 쿠폰을 드립니다.",
    "period": "2026.03.01 ~ 2026.04.30",
    "icon": "🎁",
    "color": "violet",
    "status": "ACTIVE",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T00:00:00.000Z"
  }
]
```

---

## POST /api/events

이벤트 등록 (관리자 전용)

### Request Body (JSON)

| 필드   | 타입   | 필수 | 설명                              |
|--------|--------|------|----------------------------------|
| title  | string | O    | 이벤트 제목                        |
| desc   | string | O    | 이벤트 설명                        |
| period | string | O    | 이벤트 기간                        |
| icon   | string | O    | 아이콘 (이모지)                    |
| color  | string | X    | 카드 색상 (violet, emerald, blue)  |
| status | string | X    | 상태 (ACTIVE, UPCOMING, ENDED)    |

### Response

**201 Created** — 생성된 이벤트 객체

**400 Bad Request**
```json
{ "error": "필수 항목을 입력해주세요." }
```

**403 Forbidden**
```json
{ "error": "권한이 없습니다." }
```

---

## GET /api/events/[id]

이벤트 단건 조회

### Response — 200 OK — 이벤트 객체

**404 Not Found**
```json
{ "error": "이벤트를 찾을 수 없습니다." }
```

---

## PUT /api/events/[id]

이벤트 수정 (관리자 전용)

### Request Body (JSON)

POST와 동일

### Response — 200 OK — 수정된 이벤트 객체

---

## DELETE /api/events/[id]

이벤트 삭제 (관리자 전용)

### Response — 200 OK

```json
{ "message": "삭제되었습니다." }
```