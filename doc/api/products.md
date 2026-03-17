# 상품 API

## GET /api/products

전체 상품 목록 조회 (최신순)

### Response — 200 OK

```json
[
  {
    "id": "cuid...",
    "name": "프리미엄 티모시 건초",
    "image": "/uploads/hay001.svg",
    "price": 15000,
    "remarks": "토끼 필수 건초",
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
]
```

---

## POST /api/products

상품 등록

### Request Body (FormData)

| 필드    | 타입   | 필수 | 설명                    |
|---------|--------|------|------------------------|
| name    | string | O    | 상품명                  |
| price   | string | O    | 가격 (숫자 문자열)       |
| remarks | string | X    | 비고                    |
| image   | File   | X    | 상품 이미지 파일         |

### Response

**201 Created**
```json
{ "message": "상품이 등록되었습니다.", "productId": "cuid..." }
```

**400 Bad Request**
```json
{ "error": "상품명과 가격을 입력해주세요." }
{ "error": "가격은 0보다 커야 합니다." }
```

---

## GET /api/products/[id]

상품 단건 조회

### Response — 200 OK

```json
{
  "id": "cuid...",
  "name": "프리미엄 티모시 건초",
  "image": "/uploads/hay001.svg",
  "price": 15000,
  "remarks": "토끼 필수 건초",
  "createdAt": "2026-03-01T00:00:00.000Z"
}
```

**404 Not Found**
```json
{ "error": "상품을 찾을 수 없습니다." }
```

---

## PUT /api/products/[id]

상품 수정 (관리자 전용)

### Request Body (FormData)

POST와 동일

### Response — 200 OK

```json
{ "id": "cuid...", "name": "...", "price": 15000, ... }
```

**403 Forbidden**
```json
{ "error": "권한이 없습니다." }
```

---

## DELETE /api/products/[id]

상품 삭제 (관리자 전용)

### Response — 200 OK

```json
{ "message": "삭제되었습니다." }
```

**403 Forbidden**
```json
{ "error": "권한이 없습니다." }
```