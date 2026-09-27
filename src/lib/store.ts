import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  selected_color?: string | null;
  color_heading?: string | null;
  cartItemId?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const getCartItemId = (item: CartItem) => item.selected_color ? `${item.id}_${item.selected_color}` : item.id;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const cartItemId = getCartItemId(item);
        const existingItem = state.items.find((i) => (i.cartItemId || getCartItemId(i)) === cartItemId);
        if (existingItem) {
          return {
            items: state.items.map((i) => {
              if ((i.cartItemId || getCartItemId(i)) === cartItemId) {
                const stock = item.stock ?? i.stock ?? 99;
                return { ...i, stock, quantity: Math.min(stock, i.quantity + item.quantity) };
              }
              return i;
            }),
          };
        }
        return { items: [...state.items, { ...item, cartItemId }] };
      }),
      removeItem: (cartItemIdOrId) => set((state) => ({
        items: state.items.filter((i) => (i.cartItemId || getCartItemId(i)) !== cartItemIdOrId && i.id !== cartItemIdOrId),
      })),
      updateQuantity: (cartItemIdOrId, quantity) =>
        set((state) => ({
          items: state.items.map((i) => ((i.cartItemId || getCartItemId(i)) === cartItemIdOrId || i.id === cartItemIdOrId ? { ...i, quantity: Number.isNaN(quantity) || quantity <= 0 ? 1 : quantity } : i)),

        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * (Number.isNaN(item.quantity) || item.quantity <= 0 ? 1 : item.quantity), 0);
      },
    }),
    {
      name: 'svaneya-cart',
    }
  )
);
