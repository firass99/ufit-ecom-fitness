'use client';

import { Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@repo/design-system/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@repo/design-system/components/ui/chart';
import { useTranslations } from 'next-intl';

interface Props {
  data: {
    label: string;
    value: number;
  }[];
}

export function ChartPieStatus({ data }: Props) {
  const colors = [
    'hsl(var(--chart-2))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-3))',
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  const chartConfig: ChartConfig = {
    /*     value: { label: 'Orders' },
     */ ...Object.fromEntries(
      chartData.map(({ label, fill }) => [label, { label, color: fill }]),
    ),
  };
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-semibold">
          {tCommon('distribution') +
            ' ' +
            t('orders') +
            ' ' +
            tCommon('status')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="value" hideLabel />}
            />
            <Pie data={chartData} dataKey="value" nameKey="label">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className="mt-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
