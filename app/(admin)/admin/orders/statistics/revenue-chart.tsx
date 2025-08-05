"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { formatCurrency } from "@/utils/number";
import moment from "moment";

const chartConfig = {
  revenue: {
    label: "Doanh thu trung bình",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RevenueChart({
  groupByMonth,
}: {
  groupByMonth: { month: string; orders: Order[] }[];
}) {
  const chartData = groupByMonth.map((d) => {
    return {
      month: d.month,
      revenue:
        d.orders?.reduce((acc, order) => acc + (order.finalPrice || 0), 0) || 0,
    };
  });
  const diff =
    (((chartData[5]?.revenue || 0) - (chartData[4]?.revenue || 0)) * 100) /
    (chartData[4]?.revenue || 0);
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Doanh thu hàng tháng</CardTitle>
        <CardDescription>
          {moment().subtract(6, "months").format("MMM YYYY") +
            " - " +
            moment().format("MMM YYYY")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="revenue"
              type="natural"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-revenue)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground "
                fontSize={12}
                formatter={(value: number) => formatCurrency(value)}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {diff > 0 ? (
            <div className="flex items-center gap-2">
              Doanh thu tăng{" "}
              <span className="text-primary">{diff.toFixed(2)}%</span> so với
              tháng trước
              <TrendingUp className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              Doanh thu giảm{" "}
              <span className="text-red-500">{diff.toFixed(2)}%</span> so với
              tháng trước
              <TrendingDown className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Doanh thu mỗi tháng trong 6 tháng gần nhất
        </div>
      </CardFooter>
    </Card>
  );
}
