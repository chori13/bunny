import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
  syncToServer: () => void;
  loadFromServer: () => Promise<void>;
}

const syncToServer = (items: CartItem[]) => {
  fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
    }),
  }).catch(() => {});
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity: 1 }];
          }
          syncToServer(newItems);
          return { items: newItems };
        }),
      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          syncToServer(newItems);
          return { items: newItems };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          );
          syncToServer(newItems);
          return { items: newItems };
        }),
      clearCart: () => {
        set({ items: [] });
        fetch("/api/cart", { method: "DELETE" }).catch(() => {});
      },
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      syncToServer: () => syncToServer(get().items),
      loadFromServer: async () => {
        try {
          const res = await fetch("/api/cart");
          if (!res.ok) return;
          const data = await res.json();
          if (data.items?.length > 0) {
            const localItems = get().items;
            // 서버 데이터와 로컬 데이터 병합
            const merged = [...data.items] as CartItem[];
            for (const local of localItems) {
              const exists = merged.find((m) => m.id === local.id);
              if (!exists) {
                merged.push(local);
              }
            }
            set({ items: merged });
            syncToServer(merged);
          }
        } catch {
          // 네트워크 오류 무시 - 로컬 데이터 유지
        }
      },
    }),
    { name: "bunny-cart" }
  )
);
