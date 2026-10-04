import { DiscountType } from '@prisma/client';
import { Gender, OrderStatus, PaymentStatus, Role, Size } from './enum';

// ===== Session =====
export type Session = {
  user: {
    id: string;
    role: Role;
  };
  accessToken: string;
};

// ===== User =====
export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  athlete?: Athlete | null;
  coach?: Coach | null;
  nutritionist?: Nutritionist | null;
  session?: Session | null;
  cart?: Cart | null;
  orders: Order[];
  createdAt: string;
  updatedAt: string;
};

// ===== Profile Extensions =====
export type Athlete = {
  id: string;
  age: number;
  weight: number;
  height: number;
  address: string;
  phone: string;
  userId: string;
  user: Pick<User, 'id' | 'email' | 'role'>;
  createdAt: string;
  updatedAt: string;
};

export type Coach = {
  id: string;
  gymAddress: string;
  experience: string;
  phone: string;
  specialities: string[];
  userId: string;
  user: Pick<User, 'id' | 'email' | 'role'>;
  createdAt: string;
  updatedAt: string;
};

export type Nutritionist = {
  id: string;
  workingAddress: string;
  phone: string;
  experience: string;
  cv: string;
  userId: string;
  user: Pick<User, 'id' | 'email' | 'role'>;
  createdAt: string;
  updatedAt: string;
};

// ===== Category & Translation =====
export type CategoryTranslation = {
  id: string;
  categoryId?: string;
  locale: string;
  name: string;
  description?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  image: string;
  products?: Product[];
  translations?: CategoryTranslation[];
  createdAt: string;
  updatedAt: string;
};
/* interface Category {
  id: string;
  name: string;
  translations?: Translation[];
} */
export type ProductPrice = {
  currency: string; // 'USD' | 'EUR' | 'TND' ...
  price: number;
  salePrice?: number | null;
  saleStartAt?: string | Date | null;
  saleEndAt?: string | Date | null;
};

export interface Translation {
  id: string;
  locale: string;
  name: string;
  description: string;
}

export type Brand = {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
};

export interface Variant {
  id: string;
  size?: string | null;
  color?: string | null;
  stock: number;
  prices?: ProductPrice[];
}
/* export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: Category;
  brand?: Brand | null;
  hasVariants: boolean;
  variants?: Variant[];
  // base product (non-variant) price/stock are optional if has variants
  stock?: number;
  prices?: ProductPrice[];
  translations?: Translation[];
}
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  stock?: number;
  isAvailable: boolean;
  hasVariants: boolean;
  brandId?: string;
  categoryId?: string;
  category?: Category;
  variants?: Variant;
  createdAt: string;
  updatedAt: string;
  prices?: ProductPrice[];
}

// ===== Cart =====

/* interface CartItem {
  id: string;
  product?: {
    // For simple product
    id: string;
    name: string;
    images: string[];
    price: number;
    stock: number;
  } | null;
  variant?: {
    id: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    product: {
      // The parent product
      id: string;
      name: string;
      images: string[];
    };
  } | null;
  quantity: number;
}
 */
/* interface CartItem {
  id: string;
  product?: {
    id: string;
    name: string;
    images: string[];
    price: number;
    stock: number;
    currency?: string;
  } | null;
  variant?: {
    id: string;
    size: string;
    color: string;
    price: number;
    stock: number;
    currency?: string;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  } | null;
  quantity: number;
} */

export interface CartItem {
  id: string;
  quantity: number;
  cartId: string;

  // Product (for simple products)
  product?: Product | null;

  // Variant (for variant-based products)
  variant?: VariantWithProduct | null;
}
export interface VariantWithProduct {
  id: string;
  size: string | null;
  color: string | null;
  gender: Gender;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  prices?: ProductPrice[];
  product: Product;
}

/* export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  currency?: string;
  createdAt: string;
  updatedAt: string;
} */
export interface Cart {
  id: string;
  userId: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export type Promotion = {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  maxUsage: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// ===== Order =====

export type OrderItem = {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  price: number;
  currency?: string;
  product?: Product;
  variant?: Variant;
  order: Pick<Order, 'id' | 'status'>;
  createdAt: string;
  updatedAt: string;
};

/* export type OrderItem = {
  id: string;
  orderId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  price: string;
  product?: Product;
  variant?: Variant;
  order: Pick<Order, 'id' | 'status'>;
  createdAt: string;
  updatedAt: string;
}; */
/* 
export type Order = {
  id: string;
  userId: string;
  //  user: Pick<User, 'id' | 'email'>; pick cols from USER TYPE
  user: Pick<User, 'id' | 'email' | 'fullName'>;
  items: OrderItem[];
  totalPrice: string;
  status: OrderStatus;
  payment?: Payment | null;
  trackingCode?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
};
 */
export type Order = {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'email' | 'fullName'>;
  items: OrderItem[];
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  payment?: Payment | null;
  trackingCode?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
};

// ===== Payment =====
export type Payment = {
  id: string;
  orderId: string;
  amount: string;
  provider: string;
  status: PaymentStatus;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
};
