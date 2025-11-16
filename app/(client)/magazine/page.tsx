import { APIStatus } from "@/client/callAPI";
import { getPostById, getPosts } from "@/client/post.client";
import MagazineCategoryFilter from "@/components/pages/client/magazine/categories-filter";
import LoadMorePosts from "@/components/pages/client/magazine/load-more-posts";
import Post from "@/components/pages/client/magazine/post";
import { getGlobalConfig } from "@/lib/configs";
import { Meta } from "@/types/api-response";
import { PostWithMeta, Post as TPost } from "@/types/post";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Image from "next/image";

const getPinnedPost = async (id: string) => {
  const res = await getPostById(id);
  if (!res || !res.data) {
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
const getFeaturedPost = async () => {
  const res = await getPosts(
    {
      isOutStanding: true,
      isShow: true,
      isMagazine: true,
    },
    2,
    1
  );
  if (!res || !res.data?.length) {
    return null;
  }
  return res.data;
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
  const configs = await getGlobalConfig();
  const PINNED_POST_ID = configs?.["PINNED_POST_ID"] as string;

  const query = new QueryClient();
  const [pinnedPost, _, featuredPost] = await Promise.all([
    getPinnedPost(PINNED_POST_ID),
    getRegularPosts(query, tagArr),
    getFeaturedPost(),
  ]);

  return (
    <div className="">
      <div className="relative w-full h-[155px]  sm:h-[310px] border-b border-[var(--brown-brand)]">
        <Image
          src="/icons/beckman.svg"
          alt="beckman"
          fill
          className="aspect-[1162/200] max-w-[1162px] mx-auto max-sm:p-2"
        />
      </div>
      <p className="font-bold tracking-[4px] sm:tracking-[9px] text-center border-b-4 border-[var(--brown-brand)]">
        TẠP CHÍ DÀNH CHO NHỮNG GÃ TRAI PHÓNG KHOÁNG VÀ ĐANG TÌM KIẾM CHÂN TRỜI
      </p>
      <div className="grid lg:grid-cols-5 gap-[20px] px-4 mt-8">
        {/* Featured Posts */}
        <div className="h-fit col-span-1 sm:p-[20px] sm:border-r border-[var(--brown-brand)] sm:sticky top-20">
          <h2 className="font-bold text-[40px] underline">Tin nổi bật</h2>
          <div className="space-y-5">
            {!!featuredPost?.length &&
              featuredPost.map((post) => (
                <Post post={post} key={post._id} size="small" />
              ))}
          </div>
        </div>
        <div className="lg:col-span-3 space-y-8">
          {pinnedPost && <Post post={pinnedPost} />}

          {/* Regular Posts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <HydrationBoundary state={dehydrate(query)}>
              <LoadMorePosts />
            </HydrationBoundary>
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-8 hidden sm:block">
          {/* Categories */}
          <div className="p-[20px] sm:border-l border-[var(--brown-brand)] sticky top-20">
            <h2 className="font-bold text-[40px] mb-[20px] underline">
              Danh mục
            </h2>
            <MagazineCategoryFilter />
          </div>
        </div>
      </div>
    </div>
  );
}
