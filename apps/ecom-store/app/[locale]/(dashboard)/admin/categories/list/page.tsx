import { getLocale, getTranslations } from 'next-intl/server';
import CategoriesCardsSection from '../_ui/categories-cards-section';
import CategoriesListSection from './categories-list-client';

export default async function CategoriesListPage() {
  const [] = await Promise.all([]); /* 
  const locale=await getLocale(); */
  const t = await getTranslations('dashboard.sidebar');
  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 lg:px-6 py-6">
      {/*         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
       */}{' '}
      <h1 className="text-2xl font-bold">{t('categories')}</h1>
      <CategoriesCardsSection />
      <CategoriesListSection />
    </div>
  );
}
