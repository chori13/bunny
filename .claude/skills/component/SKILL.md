신규---
name: component
description: "React 컴포넌트를 프로젝트 패턴에 맞춰 자동 생성합니다. /component 명령어나 '컴포넌트 만들어줘', 'OO 컴포넌트 생성', 'new component' 등의 요청 시 트리거됩니다. 단순히 기존 컴포넌트를 수정하는 것이 아니라 새로운 컴포넌트를 생성할 때 사용합니다."
---

# Component Generator

이 프로젝트(반려토끼 홈페이지)의 패턴에 맞는 React 컴포넌트를 생성하는 스킬입니다.

## 프로젝트 컨텍스트

- **프레임워크**: Next.js 16 + React 19 + TypeScript
- **스타일링**: TailwindCSS v4 + 커스텀 CSS 클래스 (glass, gradient-text, btn-gradient 등)
- **아이콘**: Lucide React
- **인증**: NextAuth 5 (useSession, signIn, signOut)
- **상태관리**: Zustand (persist middleware)
- **언어**: UI 텍스트는 한국어

## 워크플로우

### 1단계: 요구사항 확인

사용자에게 다음을 확인합니다 (이미 제공된 정보는 생략):

- **컴포넌트 이름**: PascalCase (예: ProductCard, BannerSlider)
- **역할/설명**: 이 컴포넌트가 무엇을 하는지
- **인증 필요 여부**: useSession이 필요한지
- **전역 상태 필요 여부**: Zustand 스토어 연동이 필요한지
- **서버/클라이언트**: 기본값은 "use client" (인터랙션이 없으면 서버 컴포넌트)

### 2단계: 컴포넌트 생성

`src/components/{ComponentName}.tsx`에 파일을 생성합니다.

#### 기본 템플릿 구조

```tsx
"use client";

import { useState } from "react";
// 필요시 추가 import

interface {ComponentName}Props {
  // props 정의
}

export default function {ComponentName}({ ...props }: {ComponentName}Props) {
  return (
    <div>
      {/* 구현 */}
    </div>
  );
}
```

#### 패턴 규칙

- **파일 위치**: 항상 `src/components/` 하위에 생성
- **export**: `export default function` 사용 (named export 아님)
- **클라이언트 컴포넌트**: 인터랙션, hooks, 브라우저 API 사용 시 `"use client"` 추가
- **Props 인터페이스**: 컴포넌트 파일 내에 `interface {Name}Props`로 정의
- **스타일링 우선순위**:
  1. 프로젝트 커스텀 클래스: `glass`, `gradient-text`, `btn-gradient`, `nav-link`
  2. TailwindCSS 유틸리티 클래스
  3. 커스텀 애니메이션: `animate-badge-bounce`, `animate-fade-in` 등
- **아이콘**: `lucide-react`에서 import (예: `import { Rabbit, Heart } from "lucide-react"`)
- **한국어 텍스트**: 모든 사용자 대면 텍스트는 한국어로 작성

#### 인증이 필요한 경우

```tsx
import { useSession } from "next-auth/react";

export default function {ComponentName}() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>로딩 중...</div>;
  if (!session) return <div>로그인이 필요합니다.</div>;

  return ( /* ... */ );
}
```

#### Zustand 상태가 필요한 경우

```tsx
import { useCartStore } from "@/store/cart";

export default function {ComponentName}() {
  const { items, addItem, removeItem } = useCartStore();
  // ...
}
```

### 3단계: 확인

- 생성된 파일 경로를 사용자에게 알려줍니다
- 필요시 사용할 페이지에서의 import 방법을 안내합니다

## 주의사항

- 기존 `src/components/` 내 파일과 이름이 겹치지 않는지 확인
- 불필요한 의존성 추가 금지 — 이미 설치된 패키지만 사용
- 과도한 추상화 금지 — 심플하게 유지
