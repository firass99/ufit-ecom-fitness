'use client';

import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/design-system/components/ui/chart';

interface Props {
  data: {
    active: number; // in-stock
    inactive: number; // out-of-stock
  };
}

export function ChartBarStacked({ data }: Props) {
  const chartData = [
    {
      label: 'Products',
      active: data.active,
      inactive: data.inactive,
    },
  ];

  const config: ChartConfig = {
    active: { label: 'In Stock', color: 'hsl(var(--chart-1))' },
    inactive: { label: 'Out of Stock', color: 'hsl(var(--chart-2))' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Status</CardTitle>
        <CardDescription>In stock vs out of stock</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="active"
              stackId="a"
              fill="hsl(var(--chart-1))"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="inactive"
              stackId="a"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Inventory trend <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total stock distribution
        </div>
      </CardFooter>
    </Card>
  );
}
