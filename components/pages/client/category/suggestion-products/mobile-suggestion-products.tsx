"use client";
import { GetProductQuery } from "@/client/product.client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSuggestionProductsInfiniteQuery } from "@/query/product.query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import ProductGrid from "../product-grid";

function MobileSuggestionProducts({
  query,
}: {
  query: Partial<GetProductQuery>;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...getSuggestionProductsInfiniteQuery(query),
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    });

  const products = data?.pages?.flatMap((page) => page?.items || []) ?? [];
  if (!products || !products?.length) return null;
  return (
    <div className={cn("mt-4 col-span-full block sm:hidden")}>
      <h2 className="text-xl font-bold mb-2 text-[var(--brown-brand)]">
        Gợi ý mua kèm
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <ProductGrid products={products} />
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

export default MobileSuggestionProducts;
