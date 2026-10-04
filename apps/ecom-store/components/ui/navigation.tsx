'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@repo/design-system/components/ui/navigation-menu';

interface NavigationProps {
  mobile?: boolean;
}

export default function Navigation({ mobile = false }: NavigationProps) {
  /* 
  export default function Navigation() {
    const t = useTranslations('navigation');
  
    const navlinks = t.raw('navbar.links') as {
      title: string;
      url: string;
    }[];

 */

  const t = useTranslations('navbar');
  const navlinks = t.raw('links') as {
    title: string;
    url: string;
  }[];

  // MOBILE: simple vertical list
  if (mobile) {
    return (
      <nav className="flex flex-col gap-1 w-full">
        {navlinks.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            prefetch={true}
            className="rounded px-3 py-2 font-medium text-base hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {link.title}
          </Link>
        ))}
      </nav>
    );
  }

  // DESKTOP: NavigationMenu (single row, no dropdowns)
  return (
    <NavigationMenu>
      <NavigationMenuList className="hidden md:flex items-center gap-4 px-4">
        {navlinks.map((link) => (
          <NavigationMenuItem key={link.url}>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              asChild
            >
              <Link href={link.url} prefetch={true}>
                {link.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
