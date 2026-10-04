'use client';

import * as React from 'react';
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
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/design-system/components/ui/chart';
import { useTranslations } from 'next-intl';

export const description = 'A bar chart showing products per category';

type CategoryData = {
  id: string;
  category: string;
  count: number;
};

export function ChartBarCategory({ data }: { data: CategoryData[] }) {
  const chartData =
    data && data.length > 0 ? data : [{ category: 'No Data', count: 0 }];

  const chartConfig: ChartConfig = {
    count: {
      label: 'Products',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t('products')} {tCommon('per')} {tCommon('category')}
        </CardTitle>
        <CardDescription>{tCommon('basedOnInventory')}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
