import { ProductWithMeta } from "@/client/product.client";
import MobileSuggestionProducts from "@/components/pages/client/category/suggestion-products/mobile-suggestion-products";
import SuggestionProducts from "@/components/pages/client/category/suggestion-products/suggestion-products";
import SuggestionProductSkeleton from "@/components/pages/client/category/suggestion-products/suggestion-products-skeletion";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { isMobileServer } from "@/lib/isMobileServer";
import { getSuggestionProductsInfiniteQuery } from "@/query/product.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
interface Props {
  searchParams: Promise<{
    prices: string;
    tags: string;
    sort: string;
    sizeTags: string;
    colorTags: string;
  }>;
  params: Promise<{
    name: string;
  }>;
}

async function Category(props: Props) {
  const configs = await getGlobalConfig();
  const userId = await getUserId();
  const CLOTHES_CATEGORY_ID = configs?.["CLOTHES_CATEGORY_ID"] as string;
  const ACCESSORY_CATEGORY_ID = configs?.["ACCESSORY_CATEGORY_ID"] as string;
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { tags, prices, sort, sizeTags, colorTags } = (() => {
    const tagString = searchParams.tags;
    const priceString = searchParams.prices;
    const sortString = searchParams.sort;
    const sizeString = searchParams.sizeTags;
    const colorString = searchParams.colorTags;
    try {
      return {
        tags: tagString ? JSON.parse(tagString) : null,
        prices: priceString ? JSON.parse(priceString) : null,
        sort: sortString ? JSON.parse(sortString) : null,
        sizeTags: sizeString ? JSON.parse(sizeString) : null,
        colorTags: colorString ? JSON.parse(colorString) : null,
      };
    } catch (e) {
      return {
        tags: null,
        prices: null,
        sort: null,
        sizeTags: null,
        colorTags: null,
      };
    }
  })();
  const isMobile = await isMobileServer();

  const queryClient = new QueryClient();
  const query = {
    status: true,
    categorySlug: params.name,
    tags,
    prices,
    sort: sort || {
      kvCode: 1,
    },
    priceRange: prices,
    sizeTags,
    colorTags,
    userId,
  };
  const suggestionMobileQuery = {
    ...query,
    suggestionCategoryIds: [CLOTHES_CATEGORY_ID, ACCESSORY_CATEGORY_ID],
  };
  isMobile &&
    (await queryClient.prefetchInfiniteQuery({
      ...getSuggestionProductsInfiniteQuery(suggestionMobileQuery),
      getNextPageParam: (
        lastPage: ProductWithMeta,
        pages: ProductWithMeta[]
      ) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    }));

  return (
    <>
      {!isMobile && CLOTHES_CATEGORY_ID && (
        <Suspense fallback={<SuggestionProductSkeleton />}>
          <SuggestionProducts
            className="hidden sm:block"
            title="Trang phục gợi ý mua kèm"
            query={{
              ...query,
              suggestionCategoryIds: [CLOTHES_CATEGORY_ID],
            }}
          />
        </Suspense>
      )}
      {!isMobile && ACCESSORY_CATEGORY_ID && (
        <Suspense fallback={<SuggestionProductSkeleton />}>
          <SuggestionProducts
            className="hidden sm:block"
            title="Phụ kiện gợi ý mua kèm"
            query={{
              ...query,
              suggestionCategoryIds: [ACCESSORY_CATEGORY_ID],
            }}
          />
        </Suspense>
      )}
      {isMobile && (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MobileSuggestionProducts query={suggestionMobileQuery} />
        </HydrationBoundary>
      )}
    </>
  );
}

export default Category;
