import { Meta } from "@/types/api-response";
import { Embed } from "@/types/embed";
import { callAPI } from "./callAPI";

interface EmbedWithMeta {
  items: Embed[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? EmbedWithMeta
  : T extends false
  ? Embed[]
  : never;

export const getEmbeds = async <T extends TypeQuery>(
  query: {
    name?: string;
  },
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return await callAPI<ObjectType<T>>(`/api/embeds`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getEmbed = async (id: string) => {
  return await callAPI<Embed>(`/api/embeds/${id}`);
};

export const createEmbed = async (data: Partial<Embed>) => {
  return await callAPI<Embed>(`/api/embeds`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateEmbed = async (id: string, data: Partial<Embed>) => {
  return await callAPI<Embed>(`/api/embeds/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteEmbeds = (ids: string[]) => {
  return callAPI<Embed>("/api/embeds", {
    method: "DELETE",
    query: {
      ids,
    },
  });
};
