"use client";
import { APIStatus } from "@/client/callAPI";
import { getStaticHTMLs } from "@/client/static-html.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Meta } from "@/types/api-response";
import { StaticHTML } from "@/types/static-html";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import StaticHTMLFilter from "./static-html-filter";
import StaticHTMLsTable from "./static-html-table";
import StaticHTMLTableSkeleton from "./static-html-table-skeleton";
import StaticHTMLActions from "./action";

function Page(props: {
  searchParams: Promise<{
    name?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const searchParams = use(props.searchParams);
  const { name, limit = 100, page = 1 } = searchParams;
  const { data: data, isLoading } = useQuery({
    queryKey: ["get-static-html", name, +limit, +page],
    queryFn: async () => {
      const res = await getStaticHTMLs(
        {
          name,
        },
        +limit,
        +page,
        true
      );
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {} as {
          items: StaticHTML[];
          meta: Meta;
        };
      return res.data;
    },
  });
  const staticHTMLs = data?.items || [];
  const meta = data?.meta;
  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh sách tệp HTML" }]} />
      <StaticHTMLFilter />
      <StaticHTMLActions/>
      {isLoading ? (
        <StaticHTMLTableSkeleton />
      ) : (
        <StaticHTMLsTable staticHTMLs={staticHTMLs} meta={meta!} />
      )}
    </div>
  );
}

export default Page;
