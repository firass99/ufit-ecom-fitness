// components/app-sidebar.tsx
'use client';

import * as React from 'react';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  BookOpen,
  Bot,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  Dumbbell,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  Hash,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  NotebookPen,
  NutOff,
  Pizza,
  SearchIcon,
  Settings2,
  SettingsIcon,
  Shapes,
  ShoppingBag,
  SquareTerminal,
  UsersIcon,
  LucideIcon,
  Percent,
  Tag,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavDocument } from '@/components/nav-document';
import { NavUser } from '@/components/nav-user';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/design-system/components/ui/sidebar';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { NavAdmin } from './nav-admin';
import { NavAthlete } from './nav-athlete';

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  sidebarData: any;
  user: {
    fullName: string;
    email: string;
    avatar?: string;
  };
};

const iconMap: Record<string, LucideIcon> = {
  ArrowUpCircleIcon,
  BarChartIcon,
  BookOpen,
  Bot,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  Dumbbell,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  Hash,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  NotebookPen,
  NutOff,
  Pizza,
  SearchIcon,
  Settings2,
  SettingsIcon,
  Shapes,
  ShoppingBag,
  SquareTerminal,
  UsersIcon,
  Percent,
  Tag,
};

export function AdminSidebar({ sidebarData, user, ...props }: AppSidebarProps) {
  // Use try-catch to handle potential missing context
  let locale: string;

  try {
    locale = useLocale();
  } catch (error) {
    console.error('Locale context not available:', error);
    // Provide fallback
    locale = 'en';
  }

  const isArabic = locale === 'ar';

  const processedNavMain = sidebarData.navMain.map((item: any) => ({
    ...item,
    icon: item.icon ? iconMap[item.icon] : undefined,
  }));

  const processedDocuments =
    sidebarData.documents?.map((item: any) => ({
      ...item,
      icon: item.icon ? iconMap[item.icon] : undefined,
    })) || [];

  return (
    <Sidebar
      collapsible="offcanvas"
      side={isArabic ? 'right' : 'left'}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={`/${locale}`}>
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">UFITPAL</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={processedNavMain} />
        {/*         <NavDocument items={processedDocuments} />
         */}{' '}
      </SidebarContent>
      <SidebarFooter>
        <NavAdmin user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
