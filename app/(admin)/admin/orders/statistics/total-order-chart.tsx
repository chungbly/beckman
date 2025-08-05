"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Order } from "@/types/order";
import moment from "moment";

export const description = "An interactive bar chart";

const chartConfig = {
  views: {
    label: "Lượng đơn",
  },
  total: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function TotalOrderChart({ orders }: { orders: Order[] }) {
  const chartData = Object.entries(
    orders?.reduce((acc, curr) => {
      if (acc[curr.createdAt]) {
        acc[curr.createdAt] += 1;
      } else {
        acc[curr.createdAt] = 1;
      }
      return acc;
    }, {} as Record<string, number>) || {}
  )
    .map(([key, value]) => ({
      date: key,
      total: value,
    }))
    .sort((a, b) =>
      moment(a.date, "DD-MMM-YY").diff(moment(b.date, "DD-MMM-YY"))
    );

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Thống kê đơn hàng</CardTitle>
          <CardDescription>
            Thống kê lượng đơn mỗi ngày trong 6 tháng qua
          </CardDescription>
        </div>
        <div className="flex">
          {/* {["desktop", "mobile"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })} */}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] 2xl:h-[500px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent className="w-[150px]" nameKey="views" />
              }
            />
            <Bar dataKey={"total"} fill={`var(--color-total)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
export default TotalOrderChart;
