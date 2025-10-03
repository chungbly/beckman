import { Meta } from "@/types/api-response";
import { Product } from "@/types/product";
import { callAPI } from "./callAPI";
import { TProductPopulated } from "@/app/(admin)/admin/products/[id]/container";

export interface ProductWithMeta {
  items: Product[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? ProductWithMeta
  : T extends false
  ? Product[]
  : never;
export type GetProductQuery = {
  ids?: number[];
  code?: string;
  name?: string;
  slug?: string;
  categoryIds?: string[];
  suggestionCategoryIds?: string[];
  similarCategoryIds?: string[];
  status?: boolean;
  isMaster?: boolean;
  isActive?: boolean;
  categorySlug?: string;
  tags: string[];
  colorTags: string[];
  sizeTags: string[];
  similarProductTags: string[];
  priceRange: number[];
  masterIds: number[];
  seed?: number;
  userId?: string;
  searchText?: string;
};
export const getProducts = async <T extends TypeQuery = false>(
  query: Partial<GetProductQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/products`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getProductsWithoutCache = async <T extends TypeQuery = false>(
  query: Partial<GetProductQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/products/search`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getVariants = async <T extends TypeQuery = false>(
  query: Partial<GetProductQuery>
) => {
  return await callAPI<ObjectType<T>>(`/api/products/variants`, {
    query: {
      q: JSON.stringify(query),
    },
  });
};

export const getSuggestionProducts = async <T extends TypeQuery = false>(
  query: Partial<GetProductQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/products/suggestions`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getSimilarProducts = async <T extends TypeQuery = false>(
  query: Partial<GetProductQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/products/similars`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getSimilarAndSuggestionProducts = async <
  T extends TypeQuery = false
>(
  query: Partial<GetProductQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(
    `/api/products/similars-and-suggestions`,
    {
      query: {
        q: JSON.stringify(query),
        limit,
        page,
        getTotal,
      },
    }
  );
};

export const getProduct = (id: number | string) => {
  return callAPI<Product>(`/api/products/${id}`);
};

export const updateProduct = async (id: number, data: Partial<TProductPopulated>) => {
  return await callAPI<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const updateProducts = async (data: Partial<Product>[]) => {
  return await callAPI<Product>(`/api/products/bulk/update`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const syncProductFromKiotViet = () => {
  return callAPI("/api/products/kiotviet-sync", {
    method: "POST",
  });
};

export const updateProductStatus = async (ids: number[], isShow: boolean) => {
  return await callAPI<Product>("/api/products/update-is-show", {
    method: "PUT",
    query: {
      ids,
      isShow,
    },
  });
};
