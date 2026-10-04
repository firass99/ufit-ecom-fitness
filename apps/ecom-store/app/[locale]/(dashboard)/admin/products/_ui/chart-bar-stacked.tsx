'use client';

import { Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
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

interface Props {
  title: string;
  data: {
    label: string;
    value: number;
  }[];
}

export function ChartBarHorizontal({ title, data }: Props) {
  const chartData = data.map((d, index) => ({
    ...d,
    fill: `hsl(var(--chart-${(index % 6) + 1}))`,
  }));

  const chartConfig: ChartConfig = {
    value: { label: 'Sales' },
    ...Object.fromEntries(
      chartData.map((d) => [d.label, { label: d.label, color: d.fill }]),
    ),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="value" layout="vertical" radius={5}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        Top-selling products in the last period
      </CardFooter>
    </Card>
  );
}
