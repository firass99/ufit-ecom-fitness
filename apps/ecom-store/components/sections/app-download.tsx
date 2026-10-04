'use client';

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

function useInViewAnimation(threshold = 0.3) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

export default function AppDownloadSection() {
  const [leftRef, leftVisible] = useInViewAnimation();
  const t = useTranslations('mobileAds');

  return (
    <section className="min-h-[50vh] flex items-center bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl w-full py-20 px-6 rounded-xl flex flex-col md:flex-row mx-auto">
        {/* Left: Animated App image */}
        <div
          ref={leftRef}
          className={`w-full md:w-1/2 flex justify-center items-center relative py-8 md:py-0
            transition-all duration-1000
            ${leftVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          {/* Floating shadow */}
          <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 w-[120px] h-5 bg-black/20 blur-[10px] rounded-full z-0" />
          <div className="w-[220px] md:w-[260px] relative z-10 flex justify-center">
            <Image
              src="/partners/mobile-app.jpg"
              alt="App screenshot"
              width={260}
              height={520}
              className="mx-auto rounded-[2.2rem] border shadow-lg bg-black"
              priority
            />
          </div>
        </div>

        {/* Right: Text and store buttons */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-center text-center gap-4 max-w-full md:max-w-[400px] mx-auto">
          <h2 className="font-bold text-2xl md:text-3xl mt-4 md:mt-0">
            {t('title')}
          </h2>
          <p className="text-muted-foreground font-semibold text-base mb-2 tracking-wide animate-pulse">
            {t('cta')}
          </p>
          <div className="flex gap-4 mt-2 justify-center">
            {/* App Store */}
            <a
              href="https://apps.apple.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Image
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                width={140}
                height={44}
                className="h-11 w-auto"
              />
            </a>
            {/* Google Play */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width={140}
                height={44}
                className="h-11 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
