"use client";

import { APIStatus } from "@/client/callAPI";
import { getOrders } from "@/client/order.client";
import PageBreadCrumb from "@/components/app-layout/page-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/order";
import { formatCurrency, formatNumber } from "@/utils/number";
import { useQuery } from "@tanstack/react-query";
import { Activity, CircleDollarSign, Clock, ShoppingCart } from "lucide-react";
import moment from "moment";
import BestSellingProduct from "./best-selling";
import { RevenueChart } from "./revenue-chart";
import OrderStatisticSkeleton from "./statustic-skeleton";
import TotalOrderChart from "./total-order-chart";

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["last-6-month-orders"],
    queryFn: async () => {
      const res = await getOrders(
        {
          createdStartDate: moment()
            .subtract(5, "M")
            .startOf("month")
            .toISOString(),
          createdEndDate: moment().endOf("month").toISOString(),
        },
        100,
        1,
        true
      );
      if (res.status !== APIStatus.OK || !res.data?.items)
        return {
          groupByMonth: [],
          groupByDate: [],
          orders: [],
        };
      let result = res.data.items;
      if (res.data.meta.hasNextPage) {
        let page = 1;
        while (true) {
          page += 1;
          const res = await getOrders(
            {
              createdStartDate: moment()
                .subtract(6, "M")
                .startOf("month")
                .toISOString(),
              createdEndDate: moment().endOf("month").toISOString(),
            },
            100,
            page,
            false
          );
          if (res.status !== APIStatus.OK || !res.data?.length) break;
          result.push(...res.data);
          if (res.data.length < 100) {
            break;
          }
        }
      }
      type OrderWithMonth = Order & { month: string };
      const orders: OrderWithMonth[] = result.map((order) => ({
        ...order,
        createdAt: moment(order.createdAt).format("DD-MMM-YY"),
        month: moment(order.createdAt).format("MMM-YY"),
      }));

      const groupByMonth = orders?.reduce((acc, order) => {
        const month = order.month;
        if (!acc[month]) {
          acc[month] = [order];
        } else {
          acc[month].push(order);
        }
        return acc;
      }, {} as Record<string, OrderWithMonth[]>);
      const groupByDate = orders?.reduce((acc, order) => {
        const date = order.createdAt;
        if (!acc[date]) {
          acc[date] = [order];
        } else {
          acc[date].push(order);
        }
        return acc;
      }, {} as Record<string, OrderWithMonth[]>);

      return {
        groupByMonth: Object.entries(groupByMonth || {}).map(
          ([key, value]) => ({
            month: key,
            orders: value,
          })
        ),
        groupByDate: Object.entries(groupByDate || {}).map(([key, value]) => ({
          date: key,
          orders: value,
        })),
        orders: orders,
      };
    },
  });

  const { groupByMonth, orders } = data || {};
  const [
    fiveMonthAgoOrders,
    fourMonthAgoOrders,
    threeMonthAgoOrders,
    twoMonthAgoOrders,
    lastMonthOrders,
    currentMonthOrders,
  ] = groupByMonth || [];

  const totalAmountOrders =
    groupByMonth?.reduce((acc, curr) => {
      return acc + (curr.orders?.length || 0);
    }, 0) || 0;
  const totalRevenue =
    groupByMonth?.reduce((acc, curr) => {
      return (
        acc +
        (curr.orders?.reduce((acc, order) => acc + order.finalPrice, 0) || 0)
      );
    }, 0) || 0;
  const amountOrdersDiff =
    (currentMonthOrders?.orders?.length || 0) -
    (lastMonthOrders?.orders?.length || 0);

  const sellingProduct = Object.entries(
    orders?.reduce((acc, curr) => {
      curr.items.forEach((item) => {
        if (acc[item.kvId]) {
          acc[item.kvId] += 1;
        } else {
          acc[item.kvId] = 1;
        }
      });
      return acc;
    }, {} as Record<string, number>) || {}
  )
    .map(([key, value]) => {
      let product;
      for (let i = 0; i < orders!.length; i++) {
        product = orders![i].items.find((item) => item.kvId === +key);
        if (product) {
          break;
        }
      }
      return {
        productId: key,
        amount: value,
        product: product!,
      };
    })
    .sort((a, b) => b.amount - a.amount);
  const bestSellingProducts = (() => {
    let count: number[] = [];
    const result = [];
    for (let i = 0; i < sellingProduct.length; i++) {
      if (count.length === 5) {
        return result;
      }
      if (!count.includes(sellingProduct[i].amount)) {
        count.push(sellingProduct[i].amount);
      }
      result.push(sellingProduct[i]);
    }
    return result;
  })();
  if (isLoading) {
    return <OrderStatisticSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-6">
      <PageBreadCrumb breadcrumbs={[{ name: "Thống kê đơn hàng" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">Thống kê đơn hàng</p>
        </div>
        {/* <Button variant="outline" className="gap-2">
          Export Report <ArrowRight className="h-4 w-4" />
        </Button> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalAmountOrders)}
            </div>
            <div className="text-sm">
              Tháng {moment().format("MM")}:{" "}
              {formatNumber(currentMonthOrders?.orders?.length || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {amountOrdersDiff >= 0
                ? ` (+${formatNumber(
                    (amountOrdersDiff * 100) /
                      (lastMonthOrders?.orders?.length || 0)
                  )}%) `
                : `(${formatNumber(
                    (amountOrdersDiff * 100) /
                      (lastMonthOrders?.orders?.length || 0)
                  )}%) `}
              so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng doanh thu 6 tháng qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sản phẩm bán chạy nhất
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <BestSellingProduct data={bestSellingProducts} />
            <p className="text-xs text-muted-foreground">
              Sản phẩm bán chạy nhất trong 6 tháng qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Số đơn hàng trung bình mỗi tháng
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                (currentMonthOrders?.orders?.length ||
                  0 + lastMonthOrders?.orders?.length ||
                  0 + twoMonthAgoOrders?.orders?.length ||
                  0 + threeMonthAgoOrders?.orders?.length ||
                  0 + fourMonthAgoOrders?.orders?.length ||
                  0 + fiveMonthAgoOrders?.orders?.length ||
                  0) / 6
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Số đơn hàng trung bình 6 tháng qua
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <TotalOrderChart orders={orders!} />
        <RevenueChart groupByMonth={groupByMonth!} />
      </div>
    </div>
  );
}
