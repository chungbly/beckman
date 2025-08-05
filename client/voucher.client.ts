import { QueryGetVoucher, Voucher, VoucherWithMeta } from "@/types/voucher";
import { callAPI } from "./callAPI";
type ObjectType<T> = T extends true
  ? VoucherWithMeta
  : T extends false
  ? Voucher[]
  : never;

export const getVouchers = async <T extends boolean = false>(
  query?: Partial<QueryGetVoucher>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  const data = await callAPI<ObjectType<T>>("/api/vouchers", {
    query: {
      q: JSON.stringify(query),
      page,
      limit,
      getTotal,
    },
    next: {
      revalidate: 0,
    },
  });
  return data;
};

export const getVoucher = async (id: string) => {
  const data = await callAPI<Voucher>(`/api/vouchers/${id}`, {
    next: {
      revalidate: 0,
    },
  });
  return data;
};

export const createVoucher = async (voucher: Voucher) => {
  const data = await callAPI<Voucher>("/api/vouchers", {
    method: "POST",
    body: JSON.stringify(voucher),
  });
  return data;
};
export const updateVoucher = async (id: string, voucher: Partial<Voucher>) => {
  const data = await callAPI<Voucher>(`/api/vouchers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(voucher),
  });
  return data;
};

export const deleteVouchers = async (ids: string[]) => {
  return callAPI("/api/vouchers", {
    method: "DELETE",
    query: {
      ids,
    },
  });
};
