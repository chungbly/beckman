import { APIStatus } from "@/client/callAPI";
import { getPostById, getPosts, getSimilarPosts } from "@/client/post.client";
import { Meta } from "@/types/api-response";
import { Post, PostWithMeta } from "@/types/post";

export const getPostsQuery = (
  query: {
    page?: number;
    title?: string;
    isShow?: boolean;
    authorId?: string;
  } = {}
) => {
  return {
    queryKey: ["get-post", query],
    queryFn: async () => {
      const res = await getPosts(query, 100, query.page || 1, true);
      if (res.status !== APIStatus.OK || !res.data)
        return {
          items: [] as Post[],
          meta: {} as Meta,
        };
      return res.data;
    },
  };
};

export const getPostByIdQuery = (id: string) => {
  return {
    queryKey: ["get-post-by-id", id],
    queryFn: async () => {
      const res = await getPostById(id);
      if (res.status !== APIStatus.OK || !res.data) return null;
      return res.data;
    },
  };
};

export const getSimilarPostsInfinityQuery = (slug: string) => {
  return {
    queryKey: ["similar-posts", slug],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getSimilarPosts(
        {
          slug,
        },
        12,
        pageParam,
        true
      );

      if (!res || res.status !== APIStatus.OK || !res.data) {
        return {
          items: [] as Post[],
          meta: {} as Meta,
        } as PostWithMeta;
      }
      return res.data;
    },
    getNextPageParam: (lastPage: PostWithMeta, pages: PostWithMeta[]) => {
      if (!lastPage?.meta?.hasNextPage) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
  };
};
