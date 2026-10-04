'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import logo from '@/public/logo.jpeg';
import Navigation from '@/components/ui/navigation';
import { LanguageDropdown } from '@/components/ui/language-dropdown';
import { Navbar as NavbarComponent } from '@repo/design-system/components/ui/navbar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { ModeToggle } from '@repo/design-system/components/ui/modeToggle';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Menu, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import CartCountBadge from '../cart-count-badge';
import { Input } from '@repo/design-system/components/ui/input';
import { useEffect, useState } from 'react';
import { Category } from '@/lib/types/types';
import { getCategories } from '@/lib/actions/categories';
import { SearchDialog } from '../search-dialog';
import { CurrencySelector } from '../ui/currency-selector';

export default function NavbarSection() {
  const params = useParams();
  const locale = useLocale();
  console.log('this is my current locale: ', locale);

  //  const locale = (params.locale as string) ?? 'en';
  const t = useTranslations('navbar');
  const account = {
    title: t('Account.title'),
    url: t('Account.url'),
  };
  const placeholder = t('search.placeholder');
  const [search, setSearch] = useState('');
  const [searchCat, setSearchCat] = useState('all');

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-2">
        <NavbarComponent className="flex items-center justify-between gap-2 h-16">
          {/* LEFT: Logo & nav */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 ms-2 text-xl font-bold"
            >
              <Image
                src={logo}
                alt="logo"
                width={44}
                height={44}
                className="rounded-full hover:opacity-80 transition"
                priority
              />
              <span className="hidden sm:inline font-semibold tracking-tight">
                UFITPAL
              </span>
            </Link>
            {/* Desktop NavigationMenu */}
            <div className="hidden md:flex ml-4">
              <Navigation />
            </div>
          </div>
          {/* RIGHT: Action buttons/components */}
          <div className="hidden md:flex items-center gap-3 pe-2">
            <SearchDialog />

            <CartCountBadge />
            <ModeToggle />
            <CurrencySelector />
            <LanguageDropdown locale={locale} />
            <Button
              className="bg-gradient-to-r from-primary to-orange-500 text-white hover:from-orange-600 hover:to-orange-400 transition"
              asChild
            >
              <Link href={account.url}>{account.title}</Link>
            </Button>
          </div>

          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] max-w-sm p-4">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src={logo}
                    alt="logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="font-bold text-xl">UFITPAL</span>
                </div>
                <Separator className="my-2" />
                {/* Mobile NavigationMenu as flat list */}
                <Navigation mobile />
                <Separator className="my-2" />

                <SearchDialog />
                <Separator className="my-2" />
                {/* Mobile right section */}
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-orange-500 text-white hover:from-orange-600 hover:to-orange-400"
                    asChild
                  >
                    <Link href={account.url}>{account.title}</Link>
                  </Button>
                  <div className="flex gap-2 items-center justify-center mt-2">
                    <CartCountBadge />
                    <ModeToggle />
                    <LanguageDropdown />
                    <CurrencySelector />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </NavbarComponent>
      </div>
    </header>
  );
}
