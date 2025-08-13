import { ProductWithMeta } from "@/client/product.client";
import CategoryContainer from "@/components/pages/client/category/container";
import { getGlobalConfig } from "@/lib/configs";
import { getUserId } from "@/lib/cookies";
import { getProductInfiniteQuery } from "@/query/product.query";
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
    keyword: string;
  }>;
}

async function Category(props: Props) {
  const userId = await getUserId();
  const configs = await getGlobalConfig();

  const searchParams = await props.searchParams;
  const { tags, prices, sort, sizeTag, colorTag, keyword } = (() => {
    const tagString = searchParams.tags;
    const priceString = searchParams.prices;
    const sortString = searchParams.sort;
    const sizeString = searchParams.sizeTag;
    const colorString = searchParams.colorTag;
    const keyword = searchParams.keyword;
    try {
      return {
        tags: tagString ? JSON.parse(tagString) : null,
        prices: priceString ? JSON.parse(priceString) : null,
        sort: sortString ? JSON.parse(sortString) : null,
        sizeTag: sizeString,
        colorTag: colorString,
        keyword: keyword,
      };
    } catch (e) {
      return {
        tags: null,
        prices: null,
        sort: null,
        sizeTag: null,
        colorTag: null,
        keyword: "",
      };
    }
  })();

  const queryClient = new QueryClient();
  const query = {
    status: true,
    tags,
    prices,
    sort: sort || {
      kvCode: 1,
    },
    priceRange: prices,
    sizeTags: sizeTag ? [sizeTag] : [],
    colorTags: colorTag ? [colorTag] : [],
    userId,
    searchText: keyword,
  };

  await queryClient.prefetchInfiniteQuery({
    ...getProductInfiniteQuery(query),
    getNextPageParam: (lastPage: ProductWithMeta, pages: ProductWithMeta[]) => {
      if (!lastPage?.meta?.hasNextPage) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
  });
  return (
    <>
      <div className="col-span-2 sm:col-span-4">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CategoryContainer query={query} configs={configs} />
        </HydrationBoundary>
      </div>
    </>
  );
}

export default Category;
