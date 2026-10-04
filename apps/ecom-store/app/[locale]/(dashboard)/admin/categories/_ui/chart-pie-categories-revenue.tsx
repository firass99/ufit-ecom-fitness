'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@repo/design-system/components/ui/card';

export function ChartPieCategoriesRevenue({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart width={320} height={250}>
          <Pie data={data} dataKey="value" nameKey="label" outerRadius={80}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </CardContent>
    </Card>
  );
}
