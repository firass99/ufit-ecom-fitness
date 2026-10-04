'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ReactNode } from 'react';
import { RTLWrapper, useRTL } from './rtl-wrapper';

interface DashboardWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Universal wrapper for all dashboard components
 * Provides RTL support, translations, and consistent styling
 */
export function DashboardWrapper({
  children,
  className = '',
  title,
  description,
}: DashboardWrapperProps) {
  const rtl = useRTL();
  const t = useTranslations('dashboard');

  return (
    <RTLWrapper className={className}>
      {(title || description) && (
        <div className={`mb-6 ${rtl.isRTL ? 'text-right' : 'text-left'}`}>
          {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </RTLWrapper>
  );
}

/**
 * RTL-aware form field wrapper
 */
export function FormField({
  label,
  children,
  required = false,
  error,
  className = '',
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  className?: string;
}) {
  const rtl = useRTL();

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        className={`block text-sm font-medium ${rtl.isRTL ? 'text-right' : 'text-left'}`}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className={rtl.isRTL ? 'text-right' : 'text-left'}>{children}</div>
      {error && (
        <p
          className={`text-sm text-destructive ${rtl.isRTL ? 'text-right' : 'text-left'}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * RTL-aware table wrapper
 */
export function TableWrapper({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const rtl = useRTL();

  return (
    <div
      className={`border rounded-md overflow-x-auto bg-background ${className}`}
    >
      <div className={rtl.isRTL ? 'rtl' : 'ltr'}>{children}</div>
    </div>
  );
}

/**
 * RTL-aware action buttons wrapper
 */
export function ActionButtons({
  children,
  align = 'right',
  className = '',
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const rtl = useRTL();

  const getAlignment = () => {
    if (align === 'center') return 'justify-center';
    if (align === 'left') return rtl.isRTL ? 'justify-end' : 'justify-start';
    return rtl.isRTL ? 'justify-start' : 'justify-end';
  };

  return (
    <div className={`flex gap-2 ${getAlignment()} ${className}`}>
      {children}
    </div>
  );
}

/**
 * RTL-aware search and filter bar
 */
export function FilterBar({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const rtl = useRTL();

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 ${rtl.isRTL ? 'flex-row-reverse' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
