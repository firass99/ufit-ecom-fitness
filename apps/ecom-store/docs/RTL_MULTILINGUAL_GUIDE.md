# RTL & Multilingual Support Guide for Dashboard Components

This guide explains how to implement RTL (Right-to-Left) and multilingual support for all dashboard components including tables, charts, and forms.

## Quick Start

### 1. Import Required Components

```tsx
import { useTranslations } from 'next-intl';
import { RTLWrapper, useRTL } from '@/components/ui/rtl-wrapper';
import {
  DashboardWrapper,
  FormField,
  TableWrapper,
  ActionButtons,
  FilterBar,
} from '@/components/ui/dashboard-wrapper';
```

### 2. Basic Component Structure

```tsx
'use client';

export default function MyDashboardComponent() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('dashboard.common');
  const tTables = useTranslations('dashboard.tables');
  const tForms = useTranslations('dashboard.forms');
  const rtl = useRTL();

  return (
    <DashboardWrapper
      title={t('sidebar.products')}
      description={t('products.description')}
    >
      {/* Your component content */}
    </DashboardWrapper>
  );
}
```

## Component Examples

### Tables with RTL Support

```tsx
function ProductsTable({ data }: { data: Product[] }) {
  const tCommon = useTranslations('dashboard.common');
  const rtl = useRTL();

  return (
    <DashboardWrapper>
      <FilterBar>
        <div className={`flex gap-3 ${rtl.isRTL ? 'flex-row-reverse' : ''}`}>
          <Select>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder={tCommon('filter')} />
            </SelectTrigger>
          </Select>
        </div>
        <Input
          placeholder={`${tCommon('search')}...`}
          className={`w-[220px] ${rtl.isRTL ? 'text-right' : 'text-left'}`}
          dir={rtl.dir}
        />
      </FilterBar>

      <TableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={rtl.isRTL ? 'text-right' : 'text-left'}>
                {tCommon('name')}
              </TableHead>
              <TableHead className={rtl.isRTL ? 'text-right' : 'text-left'}>
                {tCommon('price')}
              </TableHead>
              <TableHead className={rtl.isRTL ? 'text-right' : 'text-left'}>
                {tCommon('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className={rtl.isRTL ? 'text-right' : 'text-left'}>
                  {item.name}
                </TableCell>
                <TableCell className={rtl.isRTL ? 'text-right' : 'text-left'}>
                  {item.price}
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <Button variant="outline" size="sm">
                      {tCommon('edit')}
                    </Button>
                    <Button variant="destructive" size="sm">
                      {tCommon('delete')}
                    </Button>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </DashboardWrapper>
  );
}
```

### Forms with RTL Support

```tsx
function AddProductForm() {
  const tCommon = useTranslations('dashboard.common');
  const tForms = useTranslations('dashboard.forms');
  const rtl = useRTL();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  return (
    <DashboardWrapper title={`${tCommon('add')} ${tCommon('product')}`}>
      <div className="max-w-xl mx-auto space-y-6">
        <FormField label={tCommon('name')} required error={nameError}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tForms('selectOption')}
            className={`${rtl.isRTL ? 'text-right' : 'text-left'} form-input`}
            dir={rtl.dir}
          />
        </FormField>

        <FormField label={tCommon('price')} required>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`${rtl.isRTL ? 'text-right' : 'text-left'} form-input`}
            dir={rtl.dir}
          />
        </FormField>

        <ActionButtons align="center">
          <Button variant="outline">{tCommon('cancel')}</Button>
          <Button type="submit">{tCommon('save')}</Button>
        </ActionButtons>
      </div>
    </DashboardWrapper>
  );
}
```

### Charts with RTL Support

```tsx
function ProductsChart({ data }: { data: ChartData[] }) {
  const t = useTranslations('dashboard');
  const rtl = useRTL();

  return (
    <RTLWrapper>
      <Card className="flex flex-col">
        <CardHeader
          className={`flex-row items-start space-y-0 ${rtl.isRTL ? 'flex-row-reverse' : ''}`}
        >
          <div className="grid gap-1">
            <CardTitle>{t('products.title')}</CardTitle>
            <CardDescription>{t('products.description')}</CardDescription>
          </div>
          <Select>
            <SelectTrigger
              className={`${rtl.isRTL ? 'mr-auto' : 'ml-auto'} w-[130px]`}
            >
              <SelectValue placeholder={t('products.selectCategory')} />
            </SelectTrigger>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            {/* Your chart component */}
          </ChartContainer>
        </CardContent>
      </Card>
    </RTLWrapper>
  );
}
```

## Available Translation Keys

### Common Keys (`dashboard.common`)

- `search`, `filter`, `export`, `import`
- `save`, `cancel`, `delete`, `edit`, `view`
- `actions`, `status`, `date`, `name`, `email`
- `loading`, `noData`, `active`, `inactive`
- `confirmDelete`, `deleteSuccess`, `deleteError`
- `saveSuccess`, `saveError`

### Table Keys (`dashboard.tables`)

- `sortAscending`, `sortDescending`
- `selectAll`, `selectRow`
- `itemsPerPage`, `goToFirstPage`, `goToNextPage`

### Form Keys (`dashboard.forms`)

- `required`, `invalidEmail`, `invalidPhone`
- `selectOption`, `uploadFile`, `dragDropFile`
- `fileTooBig`, `invalidFileType`

### Sidebar Keys (`dashboard.sidebar`)

- `dashboard`, `platform`, `users`, `products`
- `orders`, `categories`, `promotions`, `brands`
- `overview`, `list`, `add`

## RTL Utilities

### useRTL Hook

```tsx
const rtl = useRTL();

// Available properties:
rtl.isRTL; // boolean
rtl.isLTR; // boolean
rtl.dir; // 'rtl' | 'ltr'
rtl.textAlign; // 'right' | 'left'
rtl.marginStart; // 'mr' | 'ml'
rtl.marginEnd; // 'ml' | 'mr'
rtl.paddingStart; // 'pr' | 'pl'
rtl.paddingEnd; // 'pl' | 'pr'
```

### CSS Classes

The following CSS classes are automatically applied for RTL:

- `.rtl .text-left` → `text-align: right`
- `.rtl .ml-auto` → `margin-right: auto`
- `.rtl .pl-4` → `padding-right: 1rem`
- `.rtl table` → `direction: rtl`
- `.rtl .form-input` → `text-align: right`

## Best Practices

1. **Always wrap components** with `RTLWrapper` or `DashboardWrapper`
2. **Use translation keys** instead of hardcoded text
3. **Apply RTL-aware classes** for margins, padding, and text alignment
4. **Test in both languages** to ensure proper layout
5. **Use semantic HTML** with proper `dir` attributes
6. **Handle form inputs** with appropriate text direction
7. **Consider icon direction** for arrows and navigation elements

## Common Patterns

### Conditional RTL Classes

```tsx
className={`flex gap-3 ${rtl.isRTL ? 'flex-row-reverse' : ''}`}
```

### Text Alignment

```tsx
className={rtl.isRTL ? 'text-right' : 'text-left'}
```

### Margin/Padding

```tsx
className={`${rtl.isRTL ? 'mr-auto' : 'ml-auto'}`}
```

### Form Inputs

```tsx
<Input
  className={`${rtl.isRTL ? 'text-right' : 'text-left'} form-input`}
  dir={rtl.dir}
/>
```

This guide ensures consistent RTL and multilingual support across all dashboard components!
