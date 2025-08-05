"use client";;
import { use } from "react";
import { APIStatus } from "@/client/callAPI";
import { getRedirects } from "@/client/redirect.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Meta } from "@/types/api-response";
import { Redirect } from "@/types/redirect";
import { useQuery } from "@tanstack/react-query";
import RedirectsFilter from "./redirect-filter";
import RedirectTableSkeleton from "./redirect-table-skeleton";
import RedirectsTable from "./redirects-table";

function Page(
  props: {
    searchParams: Promise<{
      rootUrl?: string;
      destinationUrl?: string;
      page?: number;
      limit?: number;
    }>;
  }
) {
  const searchParams = use(props.searchParams);
  const { rootUrl, destinationUrl, limit, page } = searchParams;
  const { data: data, isLoading } = useQuery({
    queryKey: ["getRedirect", rootUrl, destinationUrl, limit, page],
    queryFn: async () => {
      const res = await getRedirects(
        {
          rootUrl,
          destinationUrl,
        },
        limit,
        page,
        true
      );
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {} as {
          items: Redirect[];
          meta: Meta;
        };
      return res.data;
    },
  });
  const redirects = data?.items || [];
  const meta = data?.meta;
  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh sách Redirect" }]} />
      <RedirectsFilter />
      {isLoading ? (
        <RedirectTableSkeleton />
      ) : (
        <RedirectsTable redirects={redirects!} meta={meta!} />
      )}
    </div>
  );
}

export default Page;
