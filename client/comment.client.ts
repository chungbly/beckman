import { Comment } from "@/types/comment";
import { callAPI } from "./callAPI";
import { Meta } from "@/types/api-response";

export interface CommentWithMeta {
  items: Comment[];
  meta: Meta;
}

type TypeQuery = true | false;

type ObjectType<T> = T extends true
  ? CommentWithMeta
  : T extends false
  ? Comment[]
  : never;

export function getComments<T extends TypeQuery = false>(
  query: {
    productId?: number;
    productIds?: number[];
    productSlug?: string;
  },
  limit: number = 100,
  page: number = 1,
  getTotal = false as T
) {
  return callAPI<ObjectType<T>>("/api/comments", {
    query: {
      q: JSON.stringify(query ?? {}),
      limit,
      page,
      getTotal,
    },
  });
}

export function updateComment(id: string, data: Partial<Comment>) {
  return callAPI<Comment>(`/api/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteComment(ids: string[]) {
  return callAPI<Comment[]>(`/api/comments?ids=${ids.join()}`, {
    method: "DELETE",
  });
}

export function createComment(data: Partial<Comment>) {
  return callAPI<Comment>(`/api/comments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
