import { Meta } from "@/types/api-response";
import { Product } from "@/types/product";
import { callAPI } from "./callAPI";
import { StaticHTML } from "@/types/static-html";

export interface StaticHTMLWithMeta {
  items: StaticHTML[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? StaticHTMLWithMeta
  : T extends false
  ? StaticHTML[]
  : never;
export type GetStaticHTMLQuery = {
  id?: string[];
  name?: string;
};
export const getStaticHTMLs = async <T extends TypeQuery = false>(
  query: Partial<GetStaticHTMLQuery>,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/static-html`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getStaticHTML = (name: string) => {
  return callAPI<StaticHTML>(`/api/static-html/${name}`);
};

export const createStaticHTML = (data: Partial<StaticHTML>) => {
  return callAPI<StaticHTML>(`/api/static-html`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateStaticHTMLs = (data: {
  id: string;
  isActive: boolean;
}[]) => {
  return callAPI<StaticHTML>('/api/static-html/bulk/update', {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export const deleteStaticHTMLs = (ids: string[]) => {
  return callAPI<StaticHTML>('/api/static-html/bulk/delete', {
    method: "DELETE",
    body: JSON.stringify({
      ids
    })
  })
}