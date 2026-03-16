export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiCategory = "Auth" | "Products" | "Events" | "Community" | "Wishlist";

export interface ApiParam {
  name: string;
  type: "string" | "number" | "file";
  required: boolean;
  description: string;
  example?: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  category: ApiCategory;
  name: string;
  description: string;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  isDestructive: boolean;
  contentType: "json" | "multipart" | "none";
  pathParams?: ApiParam[];
  queryParams?: ApiParam[];
  bodyParams?: ApiParam[];
  sampleBody?: Record<string, unknown>;
}

export interface TestResult {
  endpointId: string;
  status: number;
  statusText: string;
  responseTime: number;
  responseBody: unknown;
  timestamp: Date;
  success: boolean;
}

export const categories: ApiCategory[] = [
  "Auth",
  "Products",
  "Events",
  "Community",
  "Wishlist",
];

export const endpoints: ApiEndpoint[] = [
  // ── Auth ──
  {
    id: "auth-signup",
    method: "POST",
    path: "/api/auth/signup",
    category: "Auth",
    name: "회원가입",
    description: "새 회원을 등록합니다. name과 password(6자 이상) 필요.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "json",
    bodyParams: [
      { name: "name", type: "string", required: true, description: "사용자 이름", example: "testuser" },
      { name: "password", type: "string", required: true, description: "비밀번호 (6자 이상)", example: "test1234" },
    ],
    sampleBody: { name: "testuser", password: "test1234" },
  },
  {
    id: "auth-session",
    method: "GET",
    path: "/api/auth/session",
    category: "Auth",
    name: "세션 조회",
    description: "현재 로그인 세션 정보를 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
  },

  // ── Products ──
  {
    id: "products-list",
    method: "GET",
    path: "/api/products",
    category: "Products",
    name: "상품 목록 조회",
    description: "모든 상품을 최신순으로 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
  },
  {
    id: "products-create",
    method: "POST",
    path: "/api/products",
    category: "Products",
    name: "상품 등록",
    description: "새 상품을 등록합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "multipart",
    bodyParams: [
      { name: "name", type: "string", required: true, description: "상품명", example: "테스트 상품" },
      { name: "price", type: "number", required: true, description: "가격", example: "10000" },
      { name: "remarks", type: "string", required: false, description: "비고" },
      { name: "image", type: "file", required: false, description: "상품 이미지" },
    ],
    sampleBody: { name: "테스트 상품", price: 10000, remarks: "테스트용" },
  },
  {
    id: "products-detail",
    method: "GET",
    path: "/api/products/[id]",
    category: "Products",
    name: "상품 상세 조회",
    description: "특정 상품의 상세 정보를 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "상품 ID", example: "" },
    ],
  },
  {
    id: "products-update",
    method: "PUT",
    path: "/api/products/[id]",
    category: "Products",
    name: "상품 수정",
    description: "상품 정보를 수정합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "multipart",
    pathParams: [
      { name: "id", type: "string", required: true, description: "상품 ID", example: "" },
    ],
    bodyParams: [
      { name: "name", type: "string", required: true, description: "상품명", example: "수정된 상품" },
      { name: "price", type: "number", required: true, description: "가격", example: "20000" },
      { name: "remarks", type: "string", required: false, description: "비고" },
      { name: "image", type: "file", required: false, description: "상품 이미지" },
    ],
    sampleBody: { name: "수정된 상품", price: 20000 },
  },
  {
    id: "products-delete",
    method: "DELETE",
    path: "/api/products/[id]",
    category: "Products",
    name: "상품 삭제",
    description: "상품을 삭제합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "상품 ID", example: "" },
    ],
  },

  // ── Events ──
  {
    id: "events-list",
    method: "GET",
    path: "/api/events",
    category: "Events",
    name: "이벤트 목록 조회",
    description: "모든 이벤트를 최신순으로 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
  },
  {
    id: "events-create",
    method: "POST",
    path: "/api/events",
    category: "Events",
    name: "이벤트 등록",
    description: "새 이벤트를 등록합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "json",
    bodyParams: [
      { name: "title", type: "string", required: true, description: "이벤트 제목", example: "봄맞이 세일" },
      { name: "desc", type: "string", required: true, description: "설명", example: "전 품목 20% 할인" },
      { name: "period", type: "string", required: true, description: "기간", example: "2026.03.01 ~ 03.31" },
      { name: "icon", type: "string", required: true, description: "아이콘", example: "🌸" },
      { name: "color", type: "string", required: false, description: "색상" },
      { name: "status", type: "string", required: false, description: "상태 (ACTIVE/UPCOMING/ENDED)" },
    ],
    sampleBody: { title: "봄맞이 세일", desc: "전 품목 20% 할인", period: "2026.03.01 ~ 03.31", icon: "🌸" },
  },
  {
    id: "events-detail",
    method: "GET",
    path: "/api/events/[id]",
    category: "Events",
    name: "이벤트 상세 조회",
    description: "특정 이벤트의 상세 정보를 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "이벤트 ID", example: "" },
    ],
  },
  {
    id: "events-update",
    method: "PUT",
    path: "/api/events/[id]",
    category: "Events",
    name: "이벤트 수정",
    description: "이벤트 정보를 수정합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "json",
    pathParams: [
      { name: "id", type: "string", required: true, description: "이벤트 ID", example: "" },
    ],
    bodyParams: [
      { name: "title", type: "string", required: true, description: "이벤트 제목", example: "수정된 이벤트" },
      { name: "desc", type: "string", required: true, description: "설명", example: "수정된 설명" },
      { name: "period", type: "string", required: true, description: "기간", example: "2026.04.01 ~ 04.30" },
      { name: "icon", type: "string", required: true, description: "아이콘", example: "🎉" },
    ],
    sampleBody: { title: "수정된 이벤트", desc: "수정된 설명", period: "2026.04.01 ~ 04.30", icon: "🎉" },
  },
  {
    id: "events-delete",
    method: "DELETE",
    path: "/api/events/[id]",
    category: "Events",
    name: "이벤트 삭제",
    description: "이벤트를 삭제합니다. 관리자 권한 필요.",
    requiresAuth: true,
    requiresAdmin: true,
    isDestructive: true,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "이벤트 ID", example: "" },
    ],
  },

  // ── Community ──
  {
    id: "community-list",
    method: "GET",
    path: "/api/community",
    category: "Community",
    name: "게시글 목록 조회",
    description: "모든 게시글을 최신순으로 조회합니다. 작성자, 댓글 수 포함.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
  },
  {
    id: "community-create",
    method: "POST",
    path: "/api/community",
    category: "Community",
    name: "게시글 작성",
    description: "새 게시글을 작성합니다. 로그인 필요.",
    requiresAuth: true,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "json",
    bodyParams: [
      { name: "title", type: "string", required: true, description: "제목", example: "테스트 게시글" },
      { name: "content", type: "string", required: true, description: "내용", example: "테스트 내용입니다." },
    ],
    sampleBody: { title: "테스트 게시글", content: "테스트 내용입니다." },
  },
  {
    id: "community-detail",
    method: "GET",
    path: "/api/community/[id]",
    category: "Community",
    name: "게시글 상세 조회",
    description: "특정 게시글과 댓글을 조회합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "게시글 ID", example: "" },
    ],
  },
  {
    id: "community-update",
    method: "PUT",
    path: "/api/community/[id]",
    category: "Community",
    name: "게시글 수정",
    description: "게시글을 수정합니다. 작성자 또는 관리자만 가능.",
    requiresAuth: true,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "json",
    pathParams: [
      { name: "id", type: "string", required: true, description: "게시글 ID", example: "" },
    ],
    bodyParams: [
      { name: "title", type: "string", required: true, description: "제목", example: "수정된 게시글" },
      { name: "content", type: "string", required: true, description: "내용", example: "수정된 내용입니다." },
    ],
    sampleBody: { title: "수정된 게시글", content: "수정된 내용입니다." },
  },
  {
    id: "community-delete",
    method: "DELETE",
    path: "/api/community/[id]",
    category: "Community",
    name: "게시글 삭제",
    description: "게시글을 삭제합니다. 작성자 또는 관리자만 가능.",
    requiresAuth: true,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "none",
    pathParams: [
      { name: "id", type: "string", required: true, description: "게시글 ID", example: "" },
    ],
  },
  {
    id: "community-comments-create",
    method: "POST",
    path: "/api/community/[id]/comments",
    category: "Community",
    name: "댓글 작성",
    description: "게시글에 댓글을 작성합니다. 로그인 필요.",
    requiresAuth: true,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "json",
    pathParams: [
      { name: "id", type: "string", required: true, description: "게시글 ID", example: "" },
    ],
    bodyParams: [
      { name: "content", type: "string", required: true, description: "댓글 내용", example: "좋은 글이네요!" },
    ],
    sampleBody: { content: "좋은 글이네요!" },
  },

  // ── Wishlist ──
  {
    id: "wishlist-check",
    method: "GET",
    path: "/api/wishlist",
    category: "Wishlist",
    name: "찜 상태 확인",
    description: "특정 상품의 찜 상태를 확인합니다.",
    requiresAuth: false,
    requiresAdmin: false,
    isDestructive: false,
    contentType: "none",
    queryParams: [
      { name: "productId", type: "string", required: true, description: "상품 ID", example: "" },
    ],
  },
  {
    id: "wishlist-toggle",
    method: "POST",
    path: "/api/wishlist",
    category: "Wishlist",
    name: "찜 토글",
    description: "상품의 찜 상태를 토글합니다. 로그인 필요.",
    requiresAuth: true,
    requiresAdmin: false,
    isDestructive: true,
    contentType: "json",
    bodyParams: [
      { name: "productId", type: "string", required: true, description: "상품 ID", example: "" },
    ],
    sampleBody: { productId: "" },
  },
];
