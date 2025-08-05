"use client";
import { getPostInfinityQuery } from "@/app/(client)/magazine/page";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Post from "./post";

function LoadMorePosts() {
  const searchParams = useSearchParams();
  const tags = searchParams.get("tags") || "";
  const tagArr = tags?.split(",").filter((tag) => !!tag);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getPostInfinityQuery(tagArr));

  const posts = data?.pages?.flatMap((page) => page?.items || []) ?? [];
  if (!posts || !posts?.length) return null;
  return (
    <div className={cn("mt-4 col-span-full block ")}>
      <h2 className="text-2xl font-bold mb-2 ">Câu chuyện phong cách</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
        {posts?.map((post) => (
          <Post key={post._id} post={post} />
        ))}
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
