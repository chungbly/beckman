"use client";
import { APIStatus } from "@/client/callAPI";
import { getSimilarPosts } from "@/client/post.client";
import { Button } from "@/components/ui/button";
import { Meta } from "@/types/api-response";
import { Post as TPost, PostWithMeta } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import { useParams } from "next/navigation";
import Post from "./post";
import { getSimilarPostsInfinityQuery } from "@/query/post.query";


function LoadMoreSimilarPosts() {
  const params = useParams();
  const slug = params.slug as string;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(getSimilarPostsInfinityQuery(slug));

  const posts = data?.pages?.flatMap((page) => page?.items || []) ?? [];
  if (!posts || !posts?.length) return null;
  return (
    <>
      {posts?.map((post) => (
        <Post key={post._id} post={post} size='small'/>
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
    </>
  );
}

export default LoadMoreSimilarPosts;
