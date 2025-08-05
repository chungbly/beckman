"use client";

import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Order } from "@/types/order";

export default function BestSellingProduct({
  data,
}: {
  data: {
    productId: string;
    amount: number;
    product: Order["items"][0];
  }[];
}) {
  const chartConfig = {} as Record<string, { label: string; color: string }>;
  const chartData = data.map((d, index) => {
    chartConfig[d.product.kvId] = {
      label: d.product.name,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return {
      browser: d.product.kvId,
      visitors: d.amount,
      fill: `var(--color-${d.product.kvId})`,
    };
  });
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={chartData} dataKey="visitors" label nameKey="browser" />
      </PieChart>
    </ChartContainer>
  );
}
