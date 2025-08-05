"use client";;
import { use } from "react";
import { APIStatus } from "@/client/callAPI";
import { getOrders } from "@/client/order.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Meta } from "@/types/api-response";
import { Order } from "@/types/order";
import { useQuery } from "@tanstack/react-query";
import OrderFilter from "./order-filter";
import OrderTable from "./order-table";
import OrderTableSkeleton from "./order-table-skeleton";

function Page(
  props: {
    searchParams: Promise<{
      code?: string;
      customerName?: string;
      phoneNumber?: string;
      status?: string;
      provinceCode?: string;
      districtCode?: string;
      updatedStartDate?: string;
      updatedEndDate?: string;
      createdStartDate?: string;
      createdEndDate?: string;
      wardCode?: string;
      page?: number;
      limit?: number;
    }>;
  }
) {
  const searchParams = use(props.searchParams);
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", searchParams],
    queryFn: async () => {
      const { page, limit, ...query } = searchParams;
      const res = await getOrders(query, limit, page, true);
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {} as {
          items: Order[];
          meta: Meta;
        };
      return res.data;
    },
  });
  const { items = [], meta = {} as Meta } = orders || {};

  return (
    <div className="p-2 sm:p-6 flex flex-col gap-4">
      <PageBreadCrumb breadcrumbs={[{ name: "Danh sách đơn hàng" }]} />

      <OrderFilter />
      {isLoading ? (
        <OrderTableSkeleton />
      ) : (
        <OrderTable orders={items} meta={meta} />
      )}
    </div>
  );
}

export default Page;
