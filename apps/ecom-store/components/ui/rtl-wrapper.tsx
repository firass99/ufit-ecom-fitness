'use client';

import { useLocale } from 'next-intl';
import { ReactNode } from 'react';
import { cn } from '@repo/design-system/lib/utils';

interface RTLWrapperProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function RTLWrapper({
  children,
  className = '',
  as: Component = 'div',
}: RTLWrapperProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <Component
      className={cn(isArabic ? 'rtl font-arabic' : 'ltr', className)}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {children}
    </Component>
  );
}

// Hook for RTL-aware styling
export function useRTL() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return {
    isRTL: isArabic,
    isLTR: !isArabic,
    dir: isArabic ? 'rtl' : 'ltr',
    textAlign: isArabic ? 'right' : 'left',
    marginStart: isArabic ? 'mr' : 'ml',
    marginEnd: isArabic ? 'ml' : 'mr',
    paddingStart: isArabic ? 'pr' : 'pl',
    paddingEnd: isArabic ? 'pl' : 'pr',
    borderStart: isArabic ? 'border-r' : 'border-l',
    borderEnd: isArabic ? 'border-l' : 'border-r',
    roundedStart: isArabic ? 'rounded-r' : 'rounded-l',
    roundedEnd: isArabic ? 'rounded-l' : 'rounded-r',
  };
}
