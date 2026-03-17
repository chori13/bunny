export interface Column {
  name: string;
  label: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isOptional?: boolean;
  isUnique?: boolean;
  default?: string;
  onDelete?: string;
}

export interface Table {
  id: string;
  name: string;
  comment: string;
  columns: Column[];
  position: { x: number; y: number };
}

export interface Relationship {
  from: string;
  fromColumn: string;
  to: string;
  toColumn: string;
  type: "1:N" | "1:1";
  onDelete?: string;
}

export interface EnumDef {
  name: string;
  values: string[];
}

export const enums: EnumDef[] = [
  { name: "Role", values: ["USER", "ADMIN"] },
  { name: "OrderStatus", values: ["PENDING", "PAID", "SHIPPING", "DELIVERED", "CANCELLED"] },
  { name: "EventStatus", values: ["ACTIVE", "UPCOMING", "ENDED"] },
];

export const CARD_WIDTH = 260;
export const ROW_HEIGHT = 28;
export const HEADER_HEIGHT = 44;

export const tables: Table[] = [
  {
    id: "User",
    name: "User",
    comment: "회원",
    position: { x: 80, y: 60 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "name", label: "아이디", type: "String", isUnique: true },
      { name: "password", label: "비밀번호", type: "String" },
      { name: "role", label: "권한", type: "Role", default: "USER" },
    ],
  },
  {
    id: "Product",
    name: "Product",
    comment: "상품",
    position: { x: 520, y: 60 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "name", label: "상품명", type: "String" },
      { name: "image", label: "이미지", type: "String", isOptional: true },
      { name: "price", label: "가격", type: "Int" },
      { name: "remarks", label: "비고", type: "String", isOptional: true },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
    ],
  },
  {
    id: "Event",
    name: "Event",
    comment: "이벤트",
    position: { x: 960, y: 60 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "title", label: "제목", type: "String" },
      { name: "desc", label: "설명", type: "String" },
      { name: "period", label: "기간", type: "String" },
      { name: "icon", label: "아이콘", type: "String" },
      { name: "color", label: "색상", type: "String", isOptional: true },
      { name: "status", label: "상태", type: "EventStatus", default: "ACTIVE" },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
      { name: "updatedAt", label: "수정일시", type: "DateTime" },
    ],
  },
  {
    id: "Order",
    name: "Order",
    comment: "주문",
    position: { x: 80, y: 320 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "회원 ID", type: "String", isFk: true },
      { name: "status", label: "주문 상태", type: "OrderStatus", default: "PENDING" },
      { name: "totalAmount", label: "총 금액", type: "Int" },
      { name: "recipientName", label: "수령인", type: "String" },
      { name: "phone", label: "연락처", type: "String" },
      { name: "address", label: "주소", type: "String" },
      { name: "memo", label: "배송 메모", type: "String", isOptional: true },
      { name: "paymentId", label: "결제 ID", type: "String", isOptional: true },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
      { name: "updatedAt", label: "수정일시", type: "DateTime" },
    ],
  },
  {
    id: "CartItem",
    name: "CartItem",
    comment: "장바구니",
    position: { x: 520, y: 360 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "회원 ID", type: "String", isFk: true },
      { name: "productId", label: "상품 ID", type: "String", isFk: true },
      { name: "quantity", label: "수량", type: "Int", default: "1" },
    ],
  },
  {
    id: "Review",
    name: "Review",
    comment: "리뷰",
    position: { x: 520, y: 560 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "회원 ID", type: "String", isFk: true },
      { name: "productId", label: "상품 ID", type: "String", isFk: true },
      { name: "rating", label: "평점", type: "Int" },
      { name: "content", label: "내용", type: "String", isOptional: true },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
    ],
  },
  {
    id: "OrderItem",
    name: "OrderItem",
    comment: "주문 상품",
    position: { x: 80, y: 680 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "orderId", label: "주문 ID", type: "String", isFk: true },
      { name: "productId", label: "상품 ID", type: "String", isFk: true },
      { name: "quantity", label: "수량", type: "Int" },
      { name: "price", label: "가격", type: "Int" },
    ],
  },
  {
    id: "Post",
    name: "Post",
    comment: "게시글",
    position: { x: 960, y: 360 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "작성자 ID", type: "String", isFk: true },
      { name: "title", label: "제목", type: "String" },
      { name: "content", label: "내용", type: "String" },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
      { name: "updatedAt", label: "수정일시", type: "DateTime" },
    ],
  },
  {
    id: "Comment",
    name: "Comment",
    comment: "댓글",
    position: { x: 960, y: 600 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "작성자 ID", type: "String", isFk: true },
      { name: "postId", label: "게시글 ID", type: "String", isFk: true },
      { name: "content", label: "내용", type: "String" },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
    ],
  },
  {
    id: "Wishlist",
    name: "Wishlist",
    comment: "찜하기",
    position: { x: 520, y: 740 },
    columns: [
      { name: "id", label: "고유 식별자", type: "String", isPk: true, default: "cuid()" },
      { name: "userId", label: "회원 ID", type: "String", isFk: true },
      { name: "productId", label: "상품 ID", type: "String", isFk: true },
      { name: "createdAt", label: "생성일시", type: "DateTime", default: "now()" },
    ],
  },
];

export const relationships: Relationship[] = [
  { from: "Order", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N" },
  { from: "CartItem", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Review", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Post", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Comment", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Wishlist", fromColumn: "userId", to: "User", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "CartItem", fromColumn: "productId", to: "Product", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Review", fromColumn: "productId", to: "Product", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "OrderItem", fromColumn: "productId", to: "Product", toColumn: "id", type: "1:N" },
  { from: "Wishlist", fromColumn: "productId", to: "Product", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "OrderItem", fromColumn: "orderId", to: "Order", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
  { from: "Comment", fromColumn: "postId", to: "Post", toColumn: "id", type: "1:N", onDelete: "CASCADE" },
];
