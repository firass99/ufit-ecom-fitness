'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@repo/design-system/components/ui/card';

export function ChartBarCategoriesVolume({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Units Sold by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart width={320} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Bar dataKey="value" fill="var(--chart-1)" />
        </BarChart>
      </CardContent>
    </Card>
  );
}
