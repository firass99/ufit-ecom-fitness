'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@repo/design-system/components/ui/select';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { Filter } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  translations?: { locale: string; name: string; description?: string }[];
}

interface Brand {
  id: string | number;
  name: string;
}

interface Props {
  categories: Category[];
  brands: Brand[];
  sizes: string[];
  genders: string[];
  locale: string;
  filters: any;
}

export default function ProductFilters({
  categories,
  brands,
  sizes,
  genders,
  locale,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categoryId = searchParams.get('categoryId') || 'all';
  const brandId = searchParams.get('brandId') || 'all';
  const gender = searchParams.get('gender') || 'all';
  const size = searchParams.get('size') || 'all';
  const sort = searchParams.get('sort') || 'none'; // 'none' | 'price_asc' | 'price_desc'
  const isAvailable = searchParams.get('isAvailable') === 'true';

  const getName = (cat: Category) => {
    if (!cat) return '';
    const t = cat.translations?.find((tr) => tr.locale === locale);
    return t?.name || cat.name;
  };

  const updateURL = (obj: Record<string, string>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(obj).forEach(([k, v]) => {
      if (v && v !== 'all' && v !== 'none') {
        params.set(k, v);
        if (k !== 'page') params.set('page', '1');
      } else {
        params.delete(k);
      }
    });
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/${locale}/products`);
    setMobileFilterOpen(false);
  };

  const FilterForm = (
    <div className="flex flex-col gap-4">
      {/* Category */}
      <div>
        <label className="text-xs font-semibold">
          {locale === 'ar' ? 'الفئة' : 'Category'}
        </label>
        <Select
          value={categoryId}
          onValueChange={(val) => updateURL({ categoryId: val })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue>
              {categoryId !== 'all'
                ? getName(
                    categories.find((c) => c.id === categoryId) as Category,
                  )
                : locale === 'ar'
                  ? 'كل الفئات'
                  : 'All Categories'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'كل الفئات' : 'All Categories'}
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {getName(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div>
        <label className="text-xs font-semibold">
          {locale === 'ar' ? 'العلامة' : 'Brand'}
        </label>
        <Select
          value={brandId}
          onValueChange={(val) => updateURL({ brandId: val })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue>
              {brandId !== 'all'
                ? (brands.find((b) => String(b.id) === String(brandId))?.name ??
                  '')
                : locale === 'ar'
                  ? 'كل العلامات'
                  : 'All Brands'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'كل العلامات' : 'All Brands'}
            </SelectItem>
            {brands.map((b) => (
              <SelectItem key={String(b.id)} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-semibold">
          {locale === 'ar' ? 'الجنس' : 'Gender'}
        </label>
        <Select
          value={gender}
          onValueChange={(val) => updateURL({ gender: val })}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue>
              {gender !== 'all'
                ? locale === 'ar'
                  ? gender === 'MEN'
                    ? 'رجالي'
                    : gender === 'WOMEN'
                      ? 'نسائي'
                      : 'موحد'
                  : gender.charAt(0) + gender.slice(1).toLowerCase()
                : locale === 'ar'
                  ? 'الجميع'
                  : 'All'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'الجميع' : 'All'}
            </SelectItem>
            {genders.map((g) => (
              <SelectItem key={g} value={g}>
                {locale === 'ar'
                  ? g === 'MEN'
                    ? 'رجالي'
                    : g === 'WOMEN'
                      ? 'نسائي'
                      : 'موحد'
                  : g.charAt(0) + g.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Size */}
      <div>
        <label className="text-xs font-semibold">
          {locale === 'ar' ? 'المقاس' : 'Size'}
        </label>
        <Select value={size} onValueChange={(val) => updateURL({ size: val })}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue>
              {size !== 'all' ? size : locale === 'ar' ? 'الجميع' : 'All'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'الجميع' : 'All'}
            </SelectItem>
            {sizes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Availability */}
      <div className="flex items-center gap-2">
        <input
          id="avail"
          type="checkbox"
          className="h-4 w-4"
          checked={isAvailable}
          onChange={(e) =>
            updateURL({ isAvailable: e.target.checked ? 'true' : 'all' })
          }
        />
        <label htmlFor="avail" className="text-sm">
          {locale === 'ar' ? 'متاح فقط' : 'In stock only'}
        </label>
      </div>

      {/* Sort by price */}
      <div>
        <label className="text-xs font-semibold">
          {locale === 'ar' ? 'ترتيب حسب السعر' : 'Sort by price'}
        </label>
        <Select value={sort} onValueChange={(val) => updateURL({ sort: val })}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue>
              {sort === 'price_asc'
                ? locale === 'ar'
                  ? 'الأقل إلى الأعلى'
                  : 'Low to High'
                : sort === 'price_desc'
                  ? locale === 'ar'
                    ? 'الأعلى إلى الأقل'
                    : 'High to Low'
                  : locale === 'ar'
                    ? 'بدون'
                    : 'None'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              {locale === 'ar' ? 'بدون' : 'None'}
            </SelectItem>
            <SelectItem value="price_asc">
              {locale === 'ar' ? 'الأقل إلى الأعلى' : 'Price: Low → High'}
            </SelectItem>
            <SelectItem value="price_desc">
              {locale === 'ar' ? 'الأعلى إلى الأقل' : 'Price: High → Low'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={clearFilters}
        >
          {locale === 'ar' ? 'مسح' : 'Clear'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">{FilterForm}</div>

      {/* Mobile */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-1 mb-4"
          >
            <Filter className="w-4 h-4" />
            {locale === 'ar' ? 'فلترة' : 'Filter'}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="max-w-xs w-full">
          <div className="pt-8">{FilterForm}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
