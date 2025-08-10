import { getCategoryQuery } from "@/query/category.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Container, { CategoryTree } from "./container";

export const getChildCategories = (
  categories: CategoryTree[],
  parentId: string
) => {
  let result: CategoryTree[] = [];
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].parentId === parentId) {
      result.push({
        ...categories[i],
        children: getChildCategories(categories, categories[i].id) ?? [],
      });
    }
  }
  return result;
};

async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getCategoryQuery);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container />
    </HydrationBoundary>
  );
}

export default Page;
