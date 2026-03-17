"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import UserTable, { type UserRow } from "./_components/UserTable";
import UserDetail from "./_components/UserDetail";

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
  roleCounts: { USER: number; ADMIN: number; ALL: number };
}

interface UserDetailData {
  id: string;
  name: string;
  email: string | null;
  role: string;
  totalSpent: number;
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  reviews: {
    id: string;
    rating: number;
    content: string;
    createdAt: string;
    product: { name: string };
  }[];
  posts: {
    id: string;
    title: string;
    createdAt: string;
  }[];
  _count: {
    orders: number;
    reviews: number;
    posts: number;
    comments: number;
    wishlists: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("sort", sort);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("회원 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, sort, page]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [fetchUsers, authStatus, session]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch user detail
  const handleSelectUser = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        setSelectedUser(await res.json());
      }
    } catch (error) {
      console.error("회원 상세 로드 실패:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      // Refresh detail
      const detailRes = await fetch(`/api/admin/users/${userId}`);
      if (detailRes.ok) {
        setSelectedUser(await detailRes.json());
      }
      fetchUsers();
    }
  };

  if (authStatus === "loading" || (authStatus === "authenticated" && !data && loading)) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs mb-4">
          <Users size={12} />
          User Management
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">회원 관리</h1>
        <p className="text-white/40 text-sm">
          전체 회원을 관리하고 역할을 변경할 수 있습니다
        </p>
      </div>

      {/* User Table */}
      <UserTable
        users={data?.users || []}
        total={data?.total || 0}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        roleCounts={data?.roleCounts || { USER: 0, ADMIN: 0, ALL: 0 }}
        currentRole={roleFilter}
        search={searchInput}
        sort={sort}
        onRoleFilter={(r) => {
          setRoleFilter(r);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        onPageChange={setPage}
        onSelectUser={handleSelectUser}
        loading={loading}
      />

      {/* Detail loading */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && !detailLoading && (
        <UserDetail
          user={selectedUser}
          currentUserId={session?.user?.id || ""}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleRoleChange}
        />
      )}
    </div>
  );
}
