# 회원 테이블 스키마 (User)

| 컬럼명   | 타입    | 제약조건                  | 설명                    |
|----------|---------|--------------------------|------------------------|
| id       | String  | PK, default: cuid()      | 고유 식별자              |
| name     | String  | UNIQUE, NOT NULL         | 이름                    |
| email    | String? | NULL 허용                | 이메일 주소              |
| password | String  | NOT NULL                 | 비밀번호 (bcrypt 암호화)  |
| role     | Role    | NOT NULL, default: USER  | 권한 (USER / ADMIN)     |

## Role (Enum)

| 값    | 설명       |
|-------|-----------|
| USER  | 일반 회원  |
| ADMIN | 관리자     |

## 관계

| 대상 테이블 | 관계   | 설명         |
|------------|--------|-------------|
| Order      | 1 : N  | 주문 목록     |
| Review     | 1 : N  | 리뷰 목록     |
| CartItem   | 1 : N  | 장바구니 목록  |

## 관련 기능
- [회원가입 명세](../spec/signup.md)
- [로그인 명세](../spec/login.md)
- [마이페이지 명세](../spec/mypage.md)
