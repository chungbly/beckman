"use client";
import { GetProductQuery } from "@/client/product.client";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getSimilarProductsInfiniteQuery } from "@/query/product.query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductGrid from "../category/product-grid";

function SimilarProducts({ query }: { query: Partial<GetProductQuery> }) {
  const isMobile = useIsMobile();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...getSimilarProductsInfiniteQuery(query),
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    });

  useEffect(() => {
    if (!isMobile) return;
    // Disconnect previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    // Observe the load more element
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isMobile]);

  const products = data?.pages?.flatMap((page) => page?.items || []) ?? [];
  if (!products || !products?.length) return null;

  return (
    <div className={cn("mt-4 col-span-full block px-2")}>
      <h2 className="text-xl font-bold mb-2 text-[var(--brown-brand)]">
        Sản phẩm tương tự
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <ProductGrid products={products} />
        <div className="col-span-full flex items-center justify-center">
          {hasNextPage && !isMobile && (
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
        {/* Loading indicator and intersection observer target */}
        {hasNextPage && isMobile && (
          <div
            ref={loadMoreRef}
            className="col-span-full flex items-center justify-center py-4"
          >
            {isFetchingNextPage && (
              <Loader
                size={24}
                className="animate-spin text-[var(--brown-brand)]"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimilarProducts;
