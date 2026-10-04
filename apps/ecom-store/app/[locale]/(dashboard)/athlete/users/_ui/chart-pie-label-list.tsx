'use client';

import { TrendingUp } from 'lucide-react';
import { Cell, LabelList, Pie, PieChart } from 'recharts';

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

export const description = 'A pie chart representing Users /Roles';

const chartConfig = {
  ADMIN: {
    label: 'Admin',
    color: 'hsl(var(--chart-1))',
  },
  ATHLETE: {
    label: 'Athlete',
    color: 'hsl(var(--chart-2))',
  },
  COACH: {
    label: 'Coach',
    color: 'hsl(var(--chart-3))',
  },
  NUTRITIONIST: {
    label: 'Nutritionist',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

export function ChartPieLabelList({
  data,
}: {
  data: { role: string; count: number }[];
}) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{`${t('users')} / ${tCommon('roles')}`}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="role" hideLabel />}
            />
            <Pie data={data} dataKey="count">
              {data.map((entry, index) => {
                const key =
                  entry.role.toUpperCase() as keyof typeof chartConfig;
                const color = chartConfig[key]?.color;

                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList
                dataKey="role"
                className="fill-background"
                stroke="none"
                fontSize={15}
                fontWeight="bold"
                formatter={(value: string) =>
                  chartConfig[value as keyof typeof chartConfig]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          {tCommon('showingTotalUsersPerRole')}
        </div>
      </CardFooter>
    </Card>
  );
}
