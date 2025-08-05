"use client";;
import { use } from "react";
import { APIStatus } from "@/client/callAPI";
import { getEmbeds } from "@/client/embed.client";
import { Meta } from "@/types/api-response";
import { Embed } from "@/types/embed";
import { useQuery } from "@tanstack/react-query";
import EmbbedFilter from "./embed-filter";
import EmbedsTable from "./embed-table";
import EmbedTableSkeleton from "./embed-table-skeleton";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";

function Page(
  props: {
    searchParams: Promise<{
      name?: string;
      page?: number;
      limit?: number;
    }>;
  }
) {
  const searchParams = use(props.searchParams);
  const { name, limit, page } = searchParams;
  const { data: data, isLoading } = useQuery({
    queryKey: ["getEmbeds", name, limit, page],
    queryFn: async () => {
      const res = await getEmbeds(
        {
          name,
        },
        limit,
        page,
        true
      );
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {} as {
          items: Embed[];
          meta: Meta;
        };
      return res.data;
    },
  });
  const embeds = data?.items || [];
  const meta = data?.meta;
  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <PageBreadCrumb
        breadcrumbs={[
          { name: "Danh sách Embed", href: "/admin/settings/embeds" },
        ]}
      />
      <EmbbedFilter />
      {isLoading ? (
        <EmbedTableSkeleton />
      ) : (
        <EmbedsTable embeds={embeds!} meta={meta!} />
      )}
    </div>
  );
}

export default Page;
