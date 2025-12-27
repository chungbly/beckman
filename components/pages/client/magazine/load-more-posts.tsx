"use client";
import { getPostInfinityQuery } from "@/app/(client)/magazine/get-post-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfigs } from "@/store/useConfig";
import { Post as TPost } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Post from "./post";

function LoadMorePosts() {
  const searchParams = useSearchParams();
  const tags = searchParams.get("tags") || "";
  const tagArr = tags?.split(",").map((tag) => tag.trim()).filter((tag) => !!tag);
  const configs = useConfigs((s) => s.configs);
  const PINNED_POST_ID = configs?.["PINNED_POST_ID"] as string;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getPostInfinityQuery(tagArr));

  const posts = (
    data?.pages?.flatMap((page) => page?.items || []) ?? []
  ).filter((post) => post._id !== PINNED_POST_ID);

  if (!posts || !posts?.length) return null;
  const firstPosts: TPost[] = [];
  const secondPosts: TPost[] = [];
  const thirdPosts: TPost[] = [];
  posts.forEach((post, index) => {
    if (index % 3 === 0) {
      firstPosts.push(post);
    } else if (index % 3 === 1) {
      secondPosts.push(post);
    } else {
      thirdPosts.push(post);
    }
  });

  return (
    <div
      className={cn(
        "mt-4 col-span-full block border-t pt-[20px] border-[var(--brown-brand)]"
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3  gap-4">
        <div className="space-y-[20px]">
          {firstPosts?.map((post) => (
            <Post key={post._id} post={post} size="small" />
          ))}
        </div>
        <div
          className={cn(
            "space-y-[20px] sm:px-[20px] border-[var(--brown-brand)]",
            secondPosts.length && "sm:border-l",
            thirdPosts.length && "sm:border-r"
          )}
        >
          {secondPosts?.map((post) => (
            <Post key={post._id} post={post} size="small" />
          ))}
        </div>
        <div className="space-y-[20px]">
          {thirdPosts?.map((post, index) => (
            <Post key={post._id} post={post} size="small" />
          ))}
        </div>

        <div className="col-span-full flex items-center justify-center">
          {hasNextPage && (
            <Button
              variant="ghost"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex flex-col gap-2 px-8 h-fit text-[var(--brown-brand)]"
            >
              {isFetchingNextPage ? (
                <Loader size={36} className="animate-spin" />
              ) : (
                <ChevronDown size={36} />
              )}
              {isFetchingNextPage ? "Đang tải..." : "XEM THÊM"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoadMorePosts;
