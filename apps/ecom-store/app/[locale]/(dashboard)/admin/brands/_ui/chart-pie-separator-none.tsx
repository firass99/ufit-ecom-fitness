'use client';

import { TrendingUp } from 'lucide-react';
import { Pie, PieChart } from 'recharts';
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

interface Props {
  data: {
    browser: string; // here: category name
    visitors: number;
    fill: string; // like hsl(var(--chart-1))
  }[];
}

export function ChartPieSeparatorNone({ data }: Props) {
  const config: ChartConfig = {
    visitors: { label: 'Products' },
    ...Object.fromEntries(
      data.map(({ browser, fill }) => [
        browser,
        { label: browser, color: fill },
      ]),
    ),
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Products per Category</CardTitle>
        <CardDescription>Group by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={data} dataKey="visitors" nameKey="browser" stroke="0" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Based on product category assignment
        </div>
      </CardFooter>
    </Card>
  );
}
