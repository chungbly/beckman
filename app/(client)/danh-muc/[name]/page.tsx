import { ProductWithMeta } from "@/client/product.client";
import CategoryContainer from "@/components/pages/client/category/container";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { isMobileServer } from "@/lib/isMobileServer";
import {
  getProductInfiniteQuery,
  getSuggestionProductsInfiniteQuery,
} from "@/query/product.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
interface Props {
  searchParams: Promise<{
    prices: string;
    tags: string;
    sort: string;
    sizeTag: string;
    colorTag: string;
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
  const { tags, prices, sort, sizeTag, colorTag } = (() => {
    const tagString = searchParams.tags;
    const priceString = searchParams.prices;
    const sortString = searchParams.sort;
    const sizeString = searchParams.sizeTag;
    const colorString = searchParams.colorTag;
    try {
      return {
        tags: tagString ? JSON.parse(tagString) : null,
        prices: priceString ? JSON.parse(priceString) : null,
        sort: sortString ? JSON.parse(sortString) : null,
        sizeTag: sizeString,
        colorTag: colorString,
      };
    } catch (e) {
      return {
        tags: null,
        prices: null,
        sort: null,
        sizeTag: null,
        colorTag: null,
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
    sizeTags: sizeTag ? [sizeTag] : [],
    colorTags: colorTag ? [colorTag] : [],
    userId,
  };
  const suggestionMobileQuery = {
    ...query,
    suggestionCategoryIds: [CLOTHES_CATEGORY_ID, ACCESSORY_CATEGORY_ID],
  };
  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      ...getProductInfiniteQuery(query),
      getNextPageParam: (
        lastPage: ProductWithMeta,
        pages: ProductWithMeta[]
      ) => {
        if (!lastPage?.meta?.hasNextPage) return undefined;
        return pages.length + 1;
      },
      initialPageParam: 1,
    }),
    isMobile &&
      queryClient.prefetchInfiniteQuery({
        ...getSuggestionProductsInfiniteQuery(suggestionMobileQuery),
        getNextPageParam: (
          lastPage: ProductWithMeta,
          pages: ProductWithMeta[]
        ) => {
          if (!lastPage?.meta?.hasNextPage) return undefined;
          return pages.length + 1;
        },
        initialPageParam: 1,
      }),
  ]);

  return (
    <div className="col-span-2 sm:col-span-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoryContainer query={query} />
      </HydrationBoundary>
    </div>
  );
}

export default Category;
