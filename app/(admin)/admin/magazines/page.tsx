import { Button } from "@/components/ui/button";
import { getPostsQuery } from "@/query/post.query";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import MagazineFilter from "./magazine-filter";
import MagazineTable from "./magazine-table";

interface Props {
  searchParams: Promise<{
    page: string;
    title: string;
    isShow: string;
    authorId: string;
  }>;
}

async function Page(props: Props) {
  const searchParams = await props.searchParams;
  const queryClient = new QueryClient();
  const query = {
    page: +searchParams.page || 1,
    title: searchParams.title,
    isShow: searchParams.isShow ? searchParams.isShow === "true" : true,
    authorId: searchParams.authorId,
  };
  await queryClient.prefetchQuery(getPostsQuery(query));

  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <MagazineFilter query={query} />
      <div className="flex justify-end">
        <Link href="/admin/magazines/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </Link>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MagazineTable query={query} />
      </HydrationBoundary>
    </div>
  );
}

export default Page;
