'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';

interface Props {
  data: { id: string; name: string; revenue: number; count: number }[];
}

export function ChartCategoryTotalsCard({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Totals by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {data.map((cat) => (
          <div key={cat.id} className="flex justify-between">
            <span>{cat.name}</span>
            <span className="text-muted-foreground">
              ${cat.revenue.toFixed(2)} · {cat.count} sold
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
