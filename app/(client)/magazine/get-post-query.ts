import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import { Meta } from "@/types/api-response";
import { PostWithMeta, Post as TPost } from "@/types/post";

export const getPostInfinityQuery = (tags: string[]) => {
  return {
    queryKey: ["regular-posts", tags],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getPosts(
        {
          ...(tags?.length
            ? {
                tags,
              }
            : {}),
          isOutStanding: false,
          isShow: true,
        },
        12,
        pageParam,
        true
      );

      if (!res || res.status !== APIStatus.OK || !res.data) {
        return {
          items: [] as TPost[],
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
