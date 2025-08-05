import { getSimilarAndSuggestionProducts } from "@/client/product.client";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "@/store/useCustomer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import ProductGrid from "../category/product-grid";

function SuggestionAndSimilarProducts({
  ids,
  className,
}: {
  ids: number[];
  className?: string;
}) {
  const seedRef = useRef(Math.random());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["random-products", seedRef.current, ids],
      queryFn: async ({ pageParam = 1 }) => {
        const customer = useCustomerStore.getState().customer;
        const customerId =
          customer?._id || useCustomerStore.getState().userId || "";
        const res = await getSimilarAndSuggestionProducts(
          {
            ids,
            seed: seedRef.current,
            status: true,
            userId: customerId,
          },
          10,
          pageParam,
          true
        );
        return res.data;
      },
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
      enabled: !!ids.length,
    });

  useEffect(() => {
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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const products = data?.pages?.flatMap((page) => page?.items || []) ?? [];
  if (!products || !products?.length) return null;
  return (
    <div className={cn("mt-4 col-span-full px-2 sm:px-0", className)}>
      <h2 className="text-xl md:text-2xl font-bold mb-4">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <ProductGrid products={products} />
        {hasNextPage && (
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

export default SuggestionAndSimilarProducts;
