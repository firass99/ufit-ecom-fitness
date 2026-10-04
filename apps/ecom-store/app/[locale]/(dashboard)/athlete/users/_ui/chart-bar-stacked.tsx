'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/design-system/components/ui/chart';

interface Props {
  data: { active: number; inactive: number };
}

export function ChartBarStacked({ data }: Props) {
  const chartData = [
    {
      label: 'Users',
      active: data?.active ?? 0,
      inactive: data?.inactive ?? 0,
    },
  ];

  const config: ChartConfig = {
    active: { label: 'Active', color: 'hsl(var(--chart-2))' },
    inactive: { label: 'Inactive', color: 'hsl(var(--chart-3))' },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Accounts Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="h-[200px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="active" stackId="a" fill={config.active.color} />
            <Bar dataKey="inactive" stackId="a" fill={config.inactive.color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total users per role
        </div>
      </CardFooter>
    </Card>
  );
}
