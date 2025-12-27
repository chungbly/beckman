import { GetProductQuery } from "@/client/product.client";
import { getProductsQuery } from "@/query/product.query";
import { isNil } from "@/utils";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Container from "./container";

async function Page(props: {
  searchParams: Promise<{
    code?: string;
    name?: string;
    categoryIds?: string | string[];
    status?: "true" | "false" | "all" | boolean;
    page?: string;
    limit?: string;
    isMaster?: boolean;
    isActive?: boolean;
  }>;
}) {
  const searchParams = await props.searchParams;
  const queryClient = new QueryClient();
  const { page, limit, ...query } = searchParams;
  if (isNil(query.status)) {
    query.status = true;
  } else {
    if (query.status === "all") {
      delete query.status;
    } else query.status = query.status === "true";
  }
  if (query.categoryIds)
    query.categoryIds = (query.categoryIds as string).split(",") as string[];
  await queryClient.prefetchQuery(
    getProductsQuery(
      query,
      limit ? +limit || 20 : 20,
      parseInt(searchParams.page || "1") || 1,
      true,
      false
    )
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container query={query as Partial<GetProductQuery>} />
    </HydrationBoundary>
  );
}

export default Page;
