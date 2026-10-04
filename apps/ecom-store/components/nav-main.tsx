'use client';

import { ChevronRight, MailIcon, type LucideIcon } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/design-system/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@repo/design-system/components/ui/sidebar';
import { DashboardIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/design-system/components/ui/button';
import Link from 'next/link';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const t = useTranslations('dashboard.sidebar');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  // Helper function to get translation key from title
  const getTranslationKey = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '');
  };

  // Helper function to create locale-aware URL
  const getLocalizedUrl = (url: string) => {
    if (url === '#') return url;
    return `/${locale}${url}`;
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2">
          <SidebarMenuButton
            tooltip="Quick Create"
            className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
          >
            <DashboardIcon />
            <Link href={`/${locale}/account`}>
              <span>{t('dashboard')}</span>
            </Link>
          </SidebarMenuButton>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
            variant="outline"
          >
            <MailIcon />
            <span className="sr-only">Inbox</span>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={t(getTranslationKey(item.title))}>
                  {item.icon && <item.icon />}
                  <span>{t(getTranslationKey(item.title))}</span>
                  <ChevronRight
                    className={`${isArabic ? 'mr-auto rotate-180' : 'ml-auto'} transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link href={getLocalizedUrl(subItem.url)}>
                          <span>{t(getTranslationKey(subItem.title))}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
