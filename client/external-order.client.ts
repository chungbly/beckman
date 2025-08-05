import { Meta } from "@/types/api-response";
import {
  ExternalOrder,
  ExternalOrderDto,
  ExternalOrderQuery,
} from "@/types/external-order";
import { callAPI } from "./callAPI";

export const bulkCreateExternalOrder = (orders: ExternalOrderDto[]) => {
  return callAPI(`/api/external-orders/bulk-create`, {
    method: "POST",
    body: JSON.stringify(orders),
  });
};

export interface ExternalOrderWithMeta {
  items: ExternalOrder[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? ExternalOrderWithMeta
  : T extends false
  ? ExternalOrder[]
  : never;

export const getExternalOrders = <T extends boolean = false>(
  query?: Partial<ExternalOrderQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return callAPI<ObjectType<T>>("/api/external-orders", {
    query: {
      q: JSON.stringify(query),
      page,
      limit,
      getTotal,
    },
  });
};
