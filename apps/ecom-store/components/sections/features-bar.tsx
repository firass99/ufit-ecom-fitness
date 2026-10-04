import { BadgePercent, ShieldCheck, Star, Store } from 'lucide-react';
import { useTranslations } from 'next-intl';

const iconMap = {
  Star: <Star className="w-4 h-4" />,
  BadgePercent: <BadgePercent className="w-4 h-4" />,
  Store: <Store className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
};

export default function FeaturesBar() {
  const t = useTranslations('navbar');
  const features = t.raw('features') as {
    title: string;
    icon: keyof typeof iconMap;
  }[];

  return (
    <div className="w-full bg-muted border-b border-border py-2 flex flex-wrap justify-center gap-6 md:gap-12">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-2 px-2">
          {iconMap[f.icon] ?? null}
          <div className="text-xs font-semibold leading-tight">{f.title}</div>
        </div>
      ))}
    </div>
  );
}
