"use client";
import { GetProductQuery } from "@/client/product.client";
import EmptyProducts from "@/components/product/empty-product";
import { Button } from "@/components/ui/button";
import { getProductInfiniteQuery } from "@/query/product.query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader } from "lucide-react";
import ProductGrid from "./product-grid";
import ProductSorting from "./sorting";

function CategoryContainer({
  query,
  configs,
}: {
  configs: Record<string, unknown>;
  query: Partial<GetProductQuery>;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...getProductInfiniteQuery(query),
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    });

  const products = data?.pages?.flatMap((page) => page?.items || []) ?? [];

  return (
    <>
      <ProductSorting count={data?.pages?.[0]?.meta?.itemCount ?? 0} configs={configs} />

      {products?.length ? (
        <div className="sm:my-6 max-sm:mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
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
      ) : (
        <EmptyProducts />
      )}
    </>
  );
}

export default CategoryContainer;
