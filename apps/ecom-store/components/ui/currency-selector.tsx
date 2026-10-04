'use client';

import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-auto">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Currency</SelectLabel>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="AED">AED</SelectItem>
          <SelectItem value="TND">TND</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
