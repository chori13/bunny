# SiteSetting 테이블 스키마

## 모델 정의

```prisma
model SiteSetting {
  key       String   @id
  value     String   // JSON string
  updatedAt DateTime @updatedAt
}
```

## 컬럼 설명

| 컬럼 | 타입 | 필수 | 설명 |
|------|------|------|------|
| key | String | O | PK, 설정 키 |
| value | String | O | 설정 값 (JSON 문자열) |
| updatedAt | DateTime | O | 마지막 수정 시각 (자동) |

## 기본 설정 키

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| siteName | string | "Bunny Shop" | 사이트명 |
| siteDescription | string | "건강하고 행복한 토끼를 위한..." | 사이트 설명 |
| contactEmail | string | "bunnyshop@example.com" | 연락처 이메일 |
| contactPhone | string | "02-1234-5678" | 연락처 전화번호 |
| contactAddress | string | "서울특별시 강남구" | 주소 |
| freeShippingThreshold | number | 30000 | 무료배송 기준 금액 |
| footerCopyright | string | "© 2026 Bunny Shop..." | 저작권 문구 |
| maintenanceMode | boolean | false | 점검 모드 |
| announcement | string | "" | 공지 배너 (빈 문자열 = 미표시) |

## 관련 API

- `GET /api/admin/settings` — 전체 설정 조회
- `PUT /api/admin/settings` — 설정 업데이트 (허용된 키만)

## 헬퍼 함수 (`src/lib/site-settings.ts`)

- `getSetting(key)` — 단일 설정 조회
- `getAllSettings()` — 전체 설정 조회 (DB + 기본값 병합)
- `setSetting(key, value)` — 설정 upsert
