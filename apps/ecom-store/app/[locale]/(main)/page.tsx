import HeroSection from '@/components/sections/hero-section';
import CategoriesSection from '@/components/sections/categories-section';
import FeaturesSection from '@/components/sections/features-section';
import ContactFormSection from '@/components/sections/contact-section';
import FooterSection from '@/components/sections/footer-section';
import { Separator } from '@repo/design-system/components/ui/separator';
import PartnerSection from '@/components/sections/partners-section';
import AppDownloadSection from '@/components/sections/app-download';
import FeatureBar from '@/components/sections/features-bar';
import { cookies } from 'next/headers';

export default function HomePage() {
  return (
    <>
      <FeatureBar />
      <HeroSection />
      <PartnerSection />
      <CategoriesSection />
      <Separator />
      <FeaturesSection />
      <Separator />
      <AppDownloadSection />
      <Separator />
      <ContactFormSection />
      <FooterSection />
    </>
  );
}
