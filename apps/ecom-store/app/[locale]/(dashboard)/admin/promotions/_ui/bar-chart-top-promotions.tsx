'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

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
import { TopPromo } from '@/lib/actions/analytics/promotions';
import { useTranslations } from 'next-intl';

export const description = 'A bar chart showing top used promotion codes';

export function ChartBarTopPromotions({ data }: { data: TopPromo[] }) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');
  const tChart = useTranslations('dashboard.charts');

  // ✅ Prepare data for chart
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [{ code: 'No Data', count: 0, fill: 'hsl(var(--muted))' }];
    }
    // Map the data to match the expected format
    // The actual data has 'used' instead of 'usedCount'
    return data.map((promo, index) => ({
      code: promo.code || 'Unknown',
      count: promo.used || 0, // Use 'used' property instead of 'usedCount'
      fill: `hsl(var(--chart-${(index % 8) + 3}))`,
    }));
  }, [data]);

  // ✅ Chart config (still required by ChartContainer)
  const chartConfig: ChartConfig = {
    count: {
      label: 'Usage Count',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tChart('top5') + ' ' + t('promotions')}</CardTitle>
        <CardDescription>
          {tChart('mostused') + ' ' + t('promotions')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: 20,
              right: 20,
              top: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />

            <YAxis
              dataKey="code"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.substring(0, 12)}...` : value
              }
            />
            <XAxis dataKey="count" type="number" hide />

            <ChartTooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Promo: ${label}`}
                  formatter={(value) => `${value} uses`}
                />
              }
            />

            <Bar dataKey="count" layout="vertical" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        {data && data.length > 0 ? (
          <div className="flex gap-2 leading-none font-medium">
            {tChart('top')} {tCommon('promotion')}: {chartData[0]?.code}{' '}
            <TrendingUp className="h-4 w-4" />
          </div>
        ) : (
          <div className="leading-none font-medium text-muted-foreground">
            {tCommon('noDataAvailable')}
          </div>
        )}
        <div className="text-muted-foreground leading-none">
          {tChart('showingTop')} {chartData.length > 0 ? chartData.length : 0}{' '}
          {t('promotions')}
        </div>
      </CardFooter>
    </Card>
  );
}
