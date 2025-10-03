import { TOrderInfo } from "@/types/cart";
import { create } from "zustand";

export type CartItem = {
  isSelected: boolean;
  productId: number;
  quantity: number;
  addons?: number[]; // sản phẩm mua kèm, ví dụ như giày thì có sp kèm là xi đánh giày
  gifts?: number[];
};

type CartState = {
  items: CartItem[];
  appliedVouchers: string[];
  userSelectedVouchers: string[];
  ignoreVouchers: string[];
  info: TOrderInfo;
  addItem: (productId: number, addons?: number[]) => void;
  addAddons: (productId: number, addons?: number[]) => void;
  removeAddons: (productId: number, addons?: number[]) => void;
  clearAddons: (productId: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleSelect: (productId: number) => void;
  selectAll: () => void;
  unselectAll: () => void;
  setInfo: (info: TOrderInfo) => void;
  setVoucher: (voucher: string) => void;
  removeVoucher: (voucher: string) => void;
  setAutoAppliedVouchers: (vouchers: string[]) => void;
  setUserDeselectedAutoAppliedVouchers: (vouchers: string[]) => void;
};
export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  userSelectedVouchers: [],
  ignoreVouchers: [],
  appliedVouchers: [],
  info: {
    fullName: "",
    phoneNumber: "",
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0,
    address: "",
    note: "",
  },
  addItem: (productId: number, addons?: number[]) => {
    const existing = get().items.find((i) => i.productId === productId);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.productId === productId
            ? {
                ...i,
                quantity: i.quantity + 1,
                addons: Array.from(
                  new Set([...(i.addons || []), ...(addons || [])])
                ),
              }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...get().items,
          { productId, quantity: 1, addons, isSelected: true },
        ],
      });
    }
  },
  addAddons: (productId: number, addons?: number[]) => {
    const existing = get().items.find((i) => i.productId === productId);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.productId === productId
            ? {
                ...i,
                addons: Array.from(
                  new Set([...(i.addons || []), ...(addons || [])])
                ),
              }
            : i
        ),
      });
    }
  },
  removeAddons: (productId: number, addons?: number[]) => {
    const existing = get().items.find((i) => i.productId === productId);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.productId === productId
            ? {
                ...i,
                addons: Array.from(
                  new Set([
                    ...(i.addons || []).filter((a) => !addons?.includes(a)),
                  ])
                ),
              }
            : i
        ),
      });
    }
  },
  clearAddons: (productId: number) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId
          ? {
              ...i,
              addons: [],
            }
          : i
      ),
    });
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set({
        items: get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      });
    }
  },
  clearCart: () => set({ items: [] }),
  toggleSelect: (productId) => {
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, isSelected: !i.isSelected } : i
      ),
    });
  },
  selectAll: () => {
    set({
      items: get().items.map((i) => ({ ...i, isSelected: true })),
    });
  },
  unselectAll: () => {
    set({
      items: get().items.map((i) => ({ ...i, isSelected: false })),
    });
  },
  setInfo: (info) => set({ info }),
  setVoucher: async (voucher) => {
    set({ userSelectedVouchers: [...get().userSelectedVouchers, voucher] });
  },
  removeVoucher: (voucher) => {
    set({
      userSelectedVouchers: get().userSelectedVouchers.filter(
        (v) => v !== voucher
      ),
    });
  },
  setAutoAppliedVouchers: (vouchers: string[]) => {
    set({ appliedVouchers: vouchers });
  },
  setUserDeselectedAutoAppliedVouchers: (vouchers: string[]) => {
    set({ ignoreVouchers: vouchers });
  },
}));
