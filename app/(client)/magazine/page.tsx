import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import LoadMorePosts from "@/components/pages/client/magazine/load-more-posts";
import { Breadcrumb } from "@/components/product/breadcrumb";
import { Meta } from "@/types/api-response";
import { PostWithMeta, Post as TPost } from "@/types/post";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import MagazineSlide from "./carousel";

const getPostWithSlide = async (tags: string[]) => {
  const res = await getPosts(
    {
      isSlide: true,
      isShow: true,
      isMagazine: true,

      ...(tags?.length
        ? {
            tags,
          }
        : {}),
    },
    10,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
};

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
          // isOutStanding: false,
          isSlide: false,
          isShow: true,
          isMagazine: true,
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
const getRegularPosts = async (query: QueryClient, tags: string[]) => {
  await query.prefetchInfiniteQuery(getPostInfinityQuery(tags));
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    tags: string;
  }>;
}) {
  const tags = (await searchParams).tags;
  const tagArr = tags?.split(",").filter((tag) => !!tag);

  const query = new QueryClient();
  const [postWithSlide] = await Promise.all([
    getPostWithSlide(tagArr),
    getRegularPosts(query, tagArr),
  ]);
  return (
    <>
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Magazine", href: "/magazine" },
        ]}
        className="hidden sm:flex text-[var(--brown-brand)]"
      />
      <MagazineSlide posts={postWithSlide || []} />

      {/* Regular Posts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <HydrationBoundary state={dehydrate(query)}>
          <LoadMorePosts />
        </HydrationBoundary>
      </div>
    </>
  );
}
