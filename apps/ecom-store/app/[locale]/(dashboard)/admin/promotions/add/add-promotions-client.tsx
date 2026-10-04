'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Calendar } from '@repo/design-system/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@repo/design-system/components/ui/popover';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@repo/design-system/components/ui/form';

import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/design-system/components/ui/select';

import { createPromotion, CreatePromotionDto } from '@/lib/actions/promotions';
import { useTranslations } from 'next-intl';

// -----------------------------
// ✅ Zod Schema
// -----------------------------
const promotionSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  discountType: z.enum(['PERCENTAGE', 'FIXED'], {
    required_error: 'Discount type is required',
  }),
  discountValue: z.coerce.number().positive('Value must be > 0'),
  maxUsage: z.coerce.number().int().positive().optional(),
  expiresAt: z.date().optional(),
});

type FormValues = z.infer<typeof promotionSchema>;

export default function AddPromotionsClient() {
  const router = useRouter();

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const form = useForm<FormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      discountType: 'PERCENTAGE',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: CreatePromotionDto = {
        code: data.code,
        discountType: data.discountType,
        value: parseFloat(data.discountValue.toString()), // convert to decimal
        maxUsage: data.maxUsage,
        expiresAt: data.expiresAt,
      };

      // 👇 Optional: convert to string if backend expects decimal as string
      // payload.value = payload.value.toFixed(2);

      await createPromotion(payload);
      toast.success('Promotion created!');
      router.push('/admin/promotions/list');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create promotion');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {tCommon('add') + ' ' + tCommon('promotion')}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Promo Code */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon('promoCode')}</FormLabel>
                <FormControl>
                  <Input placeholder="ABC2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Type */}
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon('discountType')}</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">
                        {tCommon('percentage')}
                      </SelectItem>
                      <SelectItem value="FIXED">{tCommon('fixed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Discount Value */}
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon('discountValue')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Usage */}
          <FormField
            control={form.control}
            name="maxUsage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon('maxUsage')}</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expires At */}
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{tCommon('expiresAt')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Input
                        readOnly
                        value={field.value ? format(field.value, 'PPP') : ''}
                        placeholder="Select a date"
                        className="cursor-pointer"
                      />
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? tCommon('creating')
              : tCommon('create') + ' ' + tCommon('promotion')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
