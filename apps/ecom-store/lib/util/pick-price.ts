export function getItemPrice(item: any, currency: string): number {
  const prices = item?.variant?.prices ?? item?.product?.prices ?? [];

  const matched = prices.find((p: any) => p.currency === currency);
  return Number(matched?.salePrice ?? matched?.price ?? 0);
}
