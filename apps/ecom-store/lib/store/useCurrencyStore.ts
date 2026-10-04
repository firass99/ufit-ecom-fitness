'use client';

import { create } from 'zustand';

type CurrencyStore = {
  currency: string;
  setCurrency: (val: string) => void;
};

function getCurrencyCookie(): string {
  if (typeof document === 'undefined') return 'USD';
  const match = document.cookie.match(/(^| )currency=([^;]+)/);
  return match?.[2] ?? 'USD';
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  currency: getCurrencyCookie(), // initial from cookie
  setCurrency: (val) => {
    document.cookie = `currency=${val}; path=/; max-age=31536000`; // 1 year
    console.log('THIS IS NEW CURRENCY ', val);

    set({ currency: val }); // update store immediately
  },
}));
