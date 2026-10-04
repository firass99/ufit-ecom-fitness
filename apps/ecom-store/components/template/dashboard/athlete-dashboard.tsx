import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';

import athleteSidebarData from './data/athlete-sidebar.json';

import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { getSession } from '@/lib/actions/session';
import { getUser } from '@/lib/actions/users';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { AthleteSidebar } from '@/components/athlete-sidebar';

export default async function AtheleteDashboardTemplate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) redirect('/');
  const user = await getUser(session?.user?.id ?? undefined);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <SidebarProvider>
          <AthleteSidebar
            sidebarData={athleteSidebarData}
            user={user}
            variant="inset"
          />
          <SidebarInset>
            <SiteHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
