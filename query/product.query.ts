import { APIStatus } from "@/client/callAPI";
import {
  GetProductQuery,
  getProducts,
  getProductsWithoutCache,
  getSimilarProducts,
  getSuggestionProducts,
  ProductWithMeta,
} from "@/client/product.client";
import { Meta } from "@/types/api-response";
import { Product } from "@/types/product";

export const getProductsQuery = <T extends boolean = false>(
  query: Record<string, unknown>,
  limit: number,
  page: number,
  getTotal: T = false as T,
  withCache = true
): {
  queryKey: (string | number | boolean | Record<string, unknown>)[];
  queryFn: () => Promise<T extends true ? ProductWithMeta : Product[]>;
} => {
  return {
    queryKey: ["products", query, limit, page, getTotal],
    queryFn: async () => {
      const res = withCache
        ? await getProducts(
            query,
            limit ? +limit : 20,
            page ? +page : 1,
            getTotal
          )
        : await getProductsWithoutCache(
            query,
            limit ? +limit : 20,
            page ? +page : 1,
            getTotal
          );
      if (getTotal) {
        if (res.status !== APIStatus.OK)
          return {
            items: [] as Product[],
            meta: {} as Meta,
          } as ProductWithMeta;
        return res.data;
      }
      if (res.status !== APIStatus.OK) return [] as any;

      return res.data;
    },
  };
};

export const getProductInfiniteQuery = (query: Partial<GetProductQuery>) => {
  return {
    queryKey: ["products", query],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getProducts(query, 12, pageParam, true);
      if (res.status !== APIStatus.OK)
        return {
          items: [],
          meta: {
            page: 0,
            limit: 0,
            itemCount: 0,
            pageCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        } as ProductWithMeta;

      return res.data!;
    },
  };
};

export const getSuggestionProductsInfiniteQuery = (
  query: Partial<GetProductQuery>
) => {
  return {
    queryKey: ["suggestion-products", query],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getSuggestionProducts(query, 12, pageParam, true);
      if (res.status !== APIStatus.OK)
        return {
          items: [],
          meta: {
            page: 0,
            limit: 0,
            itemCount: 0,
            pageCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        } as ProductWithMeta;

      return res.data!;
    },
  };
};

export const getSimilarProductsInfiniteQuery = (
  query: Partial<GetProductQuery>
) => {
  return {
    queryKey: ["similar-products", query],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getSimilarProducts(query, 8, pageParam, true);
      if (res.status !== APIStatus.OK)
        return {
          items: [],
          meta: {
            page: 0,
            limit: 0,
            itemCount: 0,
            pageCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        } as ProductWithMeta;

      return res.data!;
    },
  };
};
