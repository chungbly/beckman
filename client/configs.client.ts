import { Configs } from "@/types/configs";
import { callAPI } from "./callAPI";

export function getConfigs(
  query?: {
    isDeleted?: boolean;
    isShow?: boolean;
  },
  limit: number = 100,
  page: number = 1,
  getTotal = false
) {
  return callAPI<Configs[]>("/api/configs", {
    query: {
      q: JSON.stringify(query ?? {}),
      limit,
      page,
      getTotal,
    },
    next: {
      revalidate: 0,
    },
  });
}

export const createConfig = async (data: {
  key: string;
  value: unknown;
  description?: string;
}) => {
  return await callAPI<Configs>("/api/configs", {
    method: "POST",
    body: JSON.stringify({
      ...data,
    }),
  });
};

export const updateConfig = async (key: string, value: unknown) => {
  return await callAPI<Configs>(`/api/configs/${key}`, {
    method: "PATCH",
    body: JSON.stringify({
      value,
    }),
  });
};

export const updateStatusConfig = async (key: string, isShow: boolean) => {
  return await callAPI<Configs>(`/api/configs/${key}`, {
    method: "PATCH",
    body: JSON.stringify({
      isShow,
    }),
  });
};

export const deleteConfig = async (key: string) => {
  return await callAPI<Configs>(`/api/configs/${key}`, {
    method: "DELETE",
  });
};
