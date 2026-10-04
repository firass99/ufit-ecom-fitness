'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@repo/design-system/components/ui/card';
import { TrendingUpIcon } from 'lucide-react';

interface Props {
  stats: {
    totalUsers: number;
  };
}

export function SectionCardsUsers({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalUsers}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">Registered Accounts</div>
          <div className="text-muted-foreground">Since platform launch</div>
        </CardFooter>
      </Card>
    </div>
  );
}
