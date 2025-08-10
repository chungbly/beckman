import { GetPostQuery, Post, PostWithMeta } from "@/types/post";
import { callAPI } from "./callAPI";

type ObjectType<T> = T extends true
  ? PostWithMeta
  : T extends false
  ? Post[]
  : never;

export const getPosts = <T extends boolean = false>(
  query: GetPostQuery,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return callAPI<ObjectType<T>>(`/api/posts`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getCategoryCountByTag = async (tags: string[]) => {
  return callAPI<
    {
      tag: string;
      count: number;
    }[]
  >(`/api/posts/count-by-tags`, {
    query: {
      q: JSON.stringify({
        tags,
      }),
    },
  });
};

export const getSimilarPosts = <T extends boolean = false>(
  query: GetPostQuery,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return callAPI<ObjectType<T>>(`/api/posts/similars`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};
export const getSameAuthorPosts = <T extends boolean = false>(
  query: GetPostQuery,
  limit: number = 100,
  page: number = 1,
  getTotal: T = false as T
) => {
  return callAPI<ObjectType<T>>(`/api/posts/same-author`, {
    query: {
      q: JSON.stringify(query),
      limit,
      page,
      getTotal,
    },
  });
};

export const getPostById = (id: string) => {
  return callAPI<Post>(`/api/posts/${id}`);
};

export const deletePosts = (ids: string[]) => {
  return callAPI("/api/posts", { method: "DELETE", query: { ids } });
};

export const updatePost = (id: string, data: Partial<Post>) => {
  return callAPI(`/api/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};
