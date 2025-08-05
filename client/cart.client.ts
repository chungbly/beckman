import { CartItem } from "@/store/useCart";
import { CartBuilderRes, ShippingInfo } from "@/types/order";
import { callAPI } from "./callAPI";

type CartUpdateDTO = {
  items: CartItem[];
  userId: string;
  autoAppliedVouchers: string[];
  userSelectedVouchers: string[];
  userDeselectedAutoAppliedVouchers: string[];
  shippingInfo?: ShippingInfo | null;
};
export const getCart = async (id: string) => {
  const data = await callAPI<CartUpdateDTO>(`/api/carts/${id}`, {
    next: {
      revalidate: 0,
    },
  });
  return data;
};

export const getBuiltCart = async (
  id: string,
  items?: CartUpdateDTO["items"]
) => {
  const data = await callAPI<{
    originalCart: CartUpdateDTO;
    builtCart: CartBuilderRes;
  }>(`/api/carts/built/${id}`, {
    next: {
      revalidate: 0,
    },
    ...(items?.length && {
      query: {
        items: JSON.stringify(items),
      },
    }),
  });
  return data;
};

export const updateCart = async (
  id: string,
  voucher: Partial<CartUpdateDTO>
) => {
  const data = await callAPI<CartUpdateDTO>(`/api/carts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(voucher),
  });
  return data;
};

export const createCart = async (payload: CartUpdateDTO) => {
  const data = await callAPI<CartUpdateDTO>(`/api/carts`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
};
