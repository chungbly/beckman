import { Category } from "@/types/category";
import { cache } from "react";
import { callAPI } from "./callAPI";

export interface GetCategoryQuery {
  name?: string;
  ids?: string[];
  status?: boolean;
  slugs?: string[];
}

export function getCategories(
  query?: GetCategoryQuery,
  limit: number = 100,
  page: number = 1,
  getTotal = false
) {
  return callAPI<Category[]>("/api/categories", {
    query: {
      q: JSON.stringify(query ?? {}),
      limit,
      page,
      getTotal,
    },
  });
}

export const getCategory = cache(async (id: string) => {
  return await callAPI<Category>(`/api/categories/${id}`);
});

export const updateCategory = async (id: string, data: Partial<Category>) => {
  return await callAPI<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const updateCategoryOrderBulk = async (
  data: { id: string; index: number }[]
) => {
  return await callAPI<Category>("/api/categories/reorder-bulk", {
    method: "POST",
    body: JSON.stringify({
      categories: data,
    }),
  });
};

export const createCategory = async (data: Partial<Category>) => {
  return await callAPI<Category>(`/api/categories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCategoryStatus = async (ids: string[], status: boolean) => {
  return await callAPI<Category>("/api/categories/update-is-show", {
    method: "PUT",
    query: {
      ids,
      isShow: status,
    },
  });
};

export const deleteCategory = async (ids: string[]) => {
  return await callAPI("/api/categories", {
    method: "DELETE",
    query: {
      keys: ids,
    },
  });
};
