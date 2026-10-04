'use client';

import * as React from 'react';
import { Cell, Label, Pie, PieChart, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { useTranslations } from 'next-intl';
import { RTLWrapper, useRTL } from '@/components/ui/rtl-wrapper';

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
  ChartStyle,
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

export const description =
  'An interactive pie chart repseenting the number of products per category';

export function ChartPieInteractive({
  categoriesData,
}: {
  categoriesData: { category: string; count: number; fill: string }[];
}) {
  const t = useTranslations('dashboard');
  const rtl = useRTL();

  const chartConfig = {
    ...(Object.fromEntries(
      (categoriesData || []).map(({ category }, index) => [
        category.toLowerCase().replace(/\s+/g, '-'),
        {
          label: category,
          color: `var(--chart-${(index % 8) + 1})`, // Cycle through chart-1 to chart-8
        },
      ]),
    ) as ChartConfig),
  };
  console.log('THIS IS CHART CONFIG  :   ', chartConfig);

  const id = 'pie-interactive';
  console.log('categoriesData : ', categoriesData);

  const [activeCategory, setActiveCategory] = React.useState(
    categoriesData[0].category,
  );

  const activeIndex = React.useMemo(
    () => categoriesData.findIndex((item) => item.category === activeCategory),
    [activeCategory, categoriesData],
  );
  const categories = React.useMemo(
    () => categoriesData.map((item) => item.category),
    [categoriesData],
  );

  return (
    <RTLWrapper>
      <Card data-chart={id} className="flex flex-col">
        <ChartStyle id={id} config={chartConfig} />
        <CardHeader
          className={`flex-row items-start space-y-0 ${rtl.isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className="grid gap-1">
            <CardTitle>{t('products.title')}</CardTitle>
            <CardDescription>{t('products.description')}</CardDescription>
          </div>
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger
              className={`${rtl.isRTL ? 'mr-auto' : 'ml-auto'} h-7 w-[130px] rounded-lg ${rtl.isRTL ? 'pr-2.5' : 'pl-2.5'}`}
              aria-label="Select a value"
            >
              <SelectValue placeholder={t('products.selectCategory')} />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {categories.map((category) => {
                const configKey = category.toLowerCase().replace(/\s+/g, '-');
                const config =
                  chartConfig[configKey as keyof typeof chartConfig];

                if (!config) {
                  return null;
                }

                return (
                  <SelectItem
                    key={category}
                    value={category}
                    className="rounded-lg [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded-xs"
                        style={{
                          backgroundColor: `hsl(var(--color-${configKey}))`,
                        }}
                      />
                      {config?.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex flex-1 justify-center pb-0">
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    labelFormatter={(label) => `${label}`}
                    formatter={(value, name) => [
                      `${value} ${t('charts.products')}`,
                      name,
                    ]}
                  />
                }
              />
              <Pie
                data={categoriesData}
                dataKey="count"
                nameKey="category"
                innerRadius={60}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {categoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {categoriesData
                              .reduce((acc, curr) => acc + curr.count, 0)
                              .toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {t('products.totalProducts')}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </RTLWrapper>
  );
}
