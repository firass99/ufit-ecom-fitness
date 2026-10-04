import { create } from 'zustand';
import { CartItem } from '../types/types';

/* interface CartItem {
  id: string;
  product?: {
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
      id: string;
      name: string;
      images: string[];
    };
  } | null;
  quantity: number;
} */

interface CartState {
  items: CartItem[];
  count: number;
  itemCount: number;
  setCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  itemCount: 0,
  setCart: (items) =>
    set({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      itemCount: items.length,
    }),
  clearCart: () => set({ items: [], count: 0, itemCount: 0 }),
}));

/* // lib/store/cartStore.ts
****************
import { create } from 'zustand';
import { getCart, addToCart } from '@/lib/actions/carts';

interface CartItem {
  id: string;
  product?: {
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
      id: string;
      name: string;
      images: string[];
    };
  } | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  itemCount: number;
  initialized: boolean;

  initCart: (userId: string) => Promise<void>;
  addToCart: (
    userId: string,
    options: {
      productId?: string;
      variantId?: string;
      quantity: number;
    }
  ) => Promise<void>;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalQuantity: 0,
  itemCount: 0,
  initialized: false,

  initCart: async (userId) => {
    try {
      const cart = await getCart(userId);
      set({
        items: cart.items,
        totalQuantity: cart.items.reduce((sum, i) => sum + i.quantity, 0),
        itemCount: cart.items.length,
        initialized: true,
      });
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  },

  addToCart: async (userId, { productId, variantId, quantity }) => {
    try {
      const updatedCart = await addToCart({
        userId,
        productId,
        variantId,
        quantity,
      });

      set({
        items: updatedCart.items,
        totalQuantity: updatedCart.items.reduce((sum, i) => sum + i.quantity, 0),
        itemCount: updatedCart.items.length,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  },

  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return {
        items: newItems,
        totalQuantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
        itemCount: newItems.length,
      };
    }),

  clearCart: () => set({ items: [], totalQuantity: 0, itemCount: 0 }),
}));

 */

/* import { create } from 'zustand';

interface CartItem {
  id: string;
  product?: {
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
      id: string;
      name: string;
      images: string[];
    };
  } | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalQuantity: number; // ✅ renamed from 'count'
  itemCount: number;     // number of unique items
  setCart: (items: CartItem[]) => void;
  clearCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalQuantity: 0,
  itemCount: 0,

  setCart: (items) =>
    set({
      items,
      totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
      itemCount: items.length,
    }),

  clearCart: () =>
    set({ items: [], totalQuantity: 0, itemCount: 0 }),

  addItem: (item) =>
    set((state) => {
      const existingIndex = state.items.findIndex((i) => i.id === item.id);
      const newItems = [...state.items];

      if (existingIndex >= 0) {
        newItems[existingIndex].quantity += item.quantity;
      } else {
        newItems.push(item);
      }

      return {
        items: newItems,
        totalQuantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
        itemCount: newItems.length,
      };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== itemId);
      return {
        items: newItems,
        totalQuantity: newItems.reduce((sum, i) => sum + i.quantity, 0),
        itemCount: newItems.length,
      };
    }),
}));


 */

/* import { create } from 'zustand';

interface CartItem {
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

interface CartState {
  items: CartItem[];
  count: number; // Total quantity (all items added up)
  itemCount: number; // Unique items in cart
  setCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  count: 0,
  itemCount: 0,
  setCart: (items) =>
    set({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      itemCount: items.length,
    }),
  clearCart: () => set({ items: [], count: 0, itemCount: 0 }),
}));
 */
