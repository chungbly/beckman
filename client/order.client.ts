import { Meta } from "@/types/api-response";
import {
  CalculateOrderRes,
  CartBuilderRes,
  CreateOrderData,
  Order,
} from "@/types/order";
import { callAPI } from "./callAPI";

interface OrderWithMeta {
  items: Order[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? OrderWithMeta
  : T extends false
  ? Order[]
  : never;

export const getOrders = <T extends TypeQuery = false>(
  query: {
    customerIds?: string[];
    code?: string;
    customerName?: string;
    phoneNumber?: string;
    status?: string;
    provinceCode?: string;
    districtCode?: string;
    updatedStartDate?: string;
    updatedEndDate?: string;
    createdStartDate?: string;
    createdEndDate?: string;
    wardCode?: string;
  },
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return callAPI<ObjectType<T>>("/api/orders", {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getOrderByCode = (code: string) => {
  return callAPI<Order>(`/api/orders/${code}`);
};

export const updateOrder = (code: string, payload: Partial<Order>) => {
  return callAPI<Order>(`/api/orders/${code}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const calculatePrices = (
  items: {
    productId: number;
    quantity: number;
    addons: number[];
  }[],

  voucherCodes?: string[],
  provinceCode?: number
) => {
  return callAPI<CalculateOrderRes>(`/api/orders/calculate`, {
    method: "POST",
    body: JSON.stringify({
      items,
      voucherCodes,
      provinceCode,
    }),
  });
};

export const buildCart = (
  items: {
    productId: number;
    quantity: number;
    addons: number[];
  }[],
  voucherCodes?: string[],
  ignoreVoucherCodes?: string[],
  provinceCode?: number,
  phoneNumber?: string
) => {
  return callAPI<CartBuilderRes>(`/api/orders/build-cart`, {
    method: "POST",
    body: JSON.stringify({
      items,
      ignoreVoucherCodes,
      voucherCodes,
      provinceCode,
      phoneNumber,
    }),
  });
};

export const createOrder = (payload: CreateOrderData) => {
  return callAPI<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
