import { getPostByIdQuery } from "@/query/post.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import MagazineEditor from "./container";

async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getPostByIdQuery(id));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MagazineEditor />
    </HydrationBoundary>
  );
}

export default Page;
