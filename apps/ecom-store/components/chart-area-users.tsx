'use client';

import * as React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, TooltipProps } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/design-system/components/ui/chart';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';

interface Props {
  data: { date: string; total: number }[];
}

const chartConfig: ChartConfig = {
  total: {
    label: 'Users',
    color: 'hsl(var(--chart-1))',
  },
};

export function ChartAreaUsers({ data }: Props) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>User Signups Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <ChartTooltip
              cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Area
              dataKey="total"
              type="monotone"
              fill="url(#fillUsers)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
