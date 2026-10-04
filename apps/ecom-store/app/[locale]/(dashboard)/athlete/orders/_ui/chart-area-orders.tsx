'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/design-system/components/ui/chart';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { getOrdersCreatedByDates } from '@/lib/actions/analytics/orders';
import { useTranslations } from 'next-intl';

const chartConfig = {
  orders: {
    label: 'Orders',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function ChartAreaOrders() {
  const [timeRange, setTimeRange] = React.useState('90d');
  const [chartData, setChartData] = React.useState<
    { label: string; count: number }[]
  >([]);

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');
  const tChart = useTranslations('dashboard.charts');
  const fetchData = React.useCallback(async () => {
    try {
      let months: string | undefined = undefined;
      let beforeDays: string | undefined = undefined;

      if (timeRange === '7d') {
        beforeDays = '7';
        months = undefined;
      } else if (timeRange === '30d') {
        beforeDays = '30';
        months = undefined;
      } else if (timeRange === '90d') {
        beforeDays = undefined;
        months = '3';
      }

      const data = await getOrdersCreatedByDates(
        months ? parseInt(months) : undefined,
        undefined,
        beforeDays,
      );
      console.log('this is NEW data : ', data);
      console.log('this is before days   : ', typeof beforeDays);
      console.log('This is months : ', typeof months);

      setChartData(data);
    } catch (err) {
      console.error('Error loading orders chart:', err);
    }
  }, [timeRange]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{t('orders') + ' ' + tCommon('overview')}</CardTitle>
          <CardDescription>
            {t('orders') + ' ' + tChart('createdOverSelectedPeriod')}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder={tChart('last3Months')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d">{tChart('last3Months')}</SelectItem>
            <SelectItem value="30d">{tChart('last30Days')}</SelectItem>
            <SelectItem value="7d">{tChart('last7Days')}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-orders)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-orders)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />

            <Area
              name="Orders"
              dataKey="count"
              type="natural"
              fill="url(#fillOrders)"
              stroke="var(--color-orders)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
