'use client';

import { TrendingUpIcon } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { useTranslations } from 'next-intl';

interface Props {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
  };
}

export function SectionCards({ stats }: Props) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2  lg:grid-cols-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>
            {tCommon('total') + ' ' + t('orders')}
          </CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalOrders}
          </CardTitle>
          {/* <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div> */}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          {/* <div className="flex gap-2 font-medium">
            Orders this month <TrendingUpIcon className="size-4" />
          </div> */}
          <div className="text-muted-foreground">
            {tCommon('total') + ' ' + t('orders') + ' ' + tCommon('everMade')}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t('users')}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalUsers}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {tCommon('registered') + ' ' + t('users')}
          </div>
          {/* <div className="text-muted-foreground">Active accounts</div> */}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t('products')}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalProducts}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {tCommon('total') + ' ' + t('products')}
          </div>
          <div className="text-muted-foreground">
            {tCommon('available') + ' ' + tCommon('for') + tCommon('sale')}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>{t('categories')}</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {stats.totalCategories}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {tCommon('total') + ' ' + t('categories')}
          </div>
          {/*           <div className="text-muted-foreground">Organized listings</div>
           */}{' '}
        </CardFooter>
      </Card>
    </div>
  );
}
