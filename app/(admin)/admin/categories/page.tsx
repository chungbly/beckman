import { getCategoryQuery } from "@/query/category.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Container from "./container";

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
