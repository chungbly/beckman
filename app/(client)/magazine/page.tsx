import { APIStatus } from "@/client/callAPI";
import { getPosts } from "@/client/post.client";
import MagazineCategoryFilter from "@/components/pages/client/magazine/categories-filter";
import LoadMorePosts from "@/components/pages/client/magazine/load-more-posts";
import Post from "@/components/pages/client/magazine/post";
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

  const query = new QueryClient();
  const [postWithSlide, _, featuredPost] = await Promise.all([
    getPostWithSlide(tagArr),
    getRegularPosts(query, tagArr),
    getFeaturedPost(),
  ]);

  return (
    <div className="px-4 py-8">
      <div className="grid lg:grid-cols-5 gap-[20px]">
        {/* Featured Posts */}
        <div className="h-fit col-span-1 p-[20px] border-r border-[var(--brown-brand)]">
          <h2 className="font-bold text-[40px] underline">Tin nổi bật</h2>
          <div className="space-y-5">
            {!!featuredPost?.length &&
              featuredPost.map((post) => (
                <Post post={post} key={post._id} size="small" />
              ))}
          </div>
        </div>
        <div className="lg:col-span-3 space-y-8">
          <MagazineSlide posts={postWithSlide || []} />

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
          <div className="p-[20px] border-l border-[var(--brown-brand)]">
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
