'use client';

import { PolarRadiusAxis, RadialBar, RadialBarChart, Label } from 'recharts';
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
import { TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  total: number;
  unit: string;
}

export function ChartRadialStatRevenue({ total, unit }: Props) {
  const data = [{ value: total }];
  const config: ChartConfig = {
    value: {
      label: unit,
      color: 'hsl(var(--chart-1))',
    },
  };
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-semibold">
          {tCommon('revenue')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis
              type="number"
              domain={[0, total]}
              tick={false}
              tickLine={false}
              axisLine={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {total.toLocaleString()} {unit}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>

            <RadialBar
              dataKey="value"
              cornerRadius={5}
              fill="hsl(var(--chart-5))"
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {tCommon('revenue')} {tCommon('tillToday')}
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
