"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import OrderTable, { type OrderRow } from "./_components/OrderTable";
import OrderDetail from "./_components/OrderDetail";

interface OrdersResponse {
  orders: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

interface OrderDetailData {
  id: string;
  totalAmount: number;
  status: string;
  recipientName: string;
  phone: string;
  address: string;
  memo: string | null;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; image: string | null; price: number };
  }[];
}

export default function AdminOrdersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, authStatus, router]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("sort", sort);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("주문 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sort, page]);

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.role === "ADMIN") {
      fetchOrders();
    }
  }, [fetchOrders, authStatus, session]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch order detail
  const handleSelectOrder = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        setSelectedOrder(await res.json());
      }
    } catch (error) {
      console.error("주문 상세 로드 실패:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      const { order: updated } = await res.json();
      setSelectedOrder(updated);
      fetchOrders();
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
          <ShoppingBag size={12} />
          Order Management
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">주문 관리</h1>
        <p className="text-white/40 text-sm">
          전체 주문을 관리하고 상태를 변경할 수 있습니다
        </p>
      </div>

      {/* Order Table */}
      <OrderTable
        orders={data?.orders || []}
        total={data?.total || 0}
        page={data?.page || 1}
        totalPages={data?.totalPages || 1}
        statusCounts={data?.statusCounts || {}}
        currentStatus={statusFilter}
        search={searchInput}
        sort={sort}
        onStatusFilter={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        onSearchChange={setSearchInput}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        onPageChange={setPage}
        onSelectOrder={handleSelectOrder}
        loading={loading}
      />

      {/* Detail loading */}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !detailLoading && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
