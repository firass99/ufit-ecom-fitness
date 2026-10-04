'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, Label, Pie, PieChart } from 'recharts';

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
export function ChartPieStockStatus({
  available,
  outOfStock,
}: {
  available: number;
  outOfStock: number;
}) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const description = 'A donut chart representing stock status';

  const chartConfig = {
    Available: {
      label: tCommon('available'),
      color: 'hsl(var(--chart-2))',
    },
    'Out of Stock': {
      label: tCommon('outOfStock'),
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig;
  const total = available + outOfStock;
  const chartData = [
    { label: 'Available', value: available, fill: 'hsl(var(--chart-2))' },
    { label: 'Out of Stock', value: outOfStock, fill: 'hsl(var(--chart-3))' },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle> {tCommon('stockStatus') + ' ' + t('products')} </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0 mt-5">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={100}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {t('products')}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="value" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/2 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
