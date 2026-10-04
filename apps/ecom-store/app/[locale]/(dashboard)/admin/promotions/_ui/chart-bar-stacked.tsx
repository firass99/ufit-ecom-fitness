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
import { useTranslations } from 'next-intl';
interface Props {
  data: {
    active: number; // in-stock
    inactive: number; // out-of-stock
  };
}

export function ChartBarStacked({ data }: Props) {
  const t = useTranslations('dashboard.sidebar');
  const tChart = useTranslations('dashboard.charts');
  const chartData = [
    {
      label: t('products'),
      active: data.active,
      inactive: data.inactive,
    },
  ];

  const config: ChartConfig = {
    active: { label: tChart('inStock'), color: 'hsl(var(--chart-1))' },
    inactive: { label: tChart('outOfStock'), color: 'hsl(var(--chart-2))' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tChart('stockStatus')}</CardTitle>
        <CardDescription>{tChart('inStockVsOutOfStock')}</CardDescription>
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
          {tChart('inventoryTrend')} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {tChart('totalStockDistribution')}
        </div>
      </CardFooter>
    </Card>
  );
}
