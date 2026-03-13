import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../stores/store";
import type { TProduct } from "../types/product.type";
import type { CartItem, CartVariant } from "../types/cart.type";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: TProduct, qty: number, variant?: CartVariant) => void;
  increase: (productId: string, variant?: CartVariant) => void;
  decrease: (productId: string, variant?: CartVariant) => void;
  removeItem: (productId: string, variant?: CartVariant) => void;
  clear: () => void;
  total: number;
};

function getCartKey(userId?: string) {
  return userId ? `cart_user_${userId}` : "cart_guest";
}

/** đọc cart theo user */
function readCartByKey(key: string): { items: CartItem[] } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as unknown;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { items: unknown }).items)
    ) {
      return { items: [] };
    }

    return parsed as { items: CartItem[] };
  } catch {
    return { items: [] };
  }
}

function writeCartByKey(key: string, items: CartItem[]) {
  localStorage.setItem(key, JSON.stringify({ items }));
}

function sameVariant(a?: CartVariant, b?: CartVariant) {
  return (
    (a?.color ?? "") === (b?.color ?? "") &&
    (a?.size ?? "") === (b?.size ?? "")
  );
}

function toCartItem(
  product: TProduct,
  qty: number,
  variant?: CartVariant,
): CartItem {
  const unitPrice =
    product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price;

  const image = product.primaryImage || product.images?.[0] || "";

  return {
    id: String(product._id),
    slug: product.slug,
    name: product.name,
    price: unitPrice,
    quantity: qty,
    image,
    variant,
  };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const cartKey = getCartKey(user?.id);

  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const cart = readCartByKey(cartKey);
    setItems(cart.items);
  }, [cartKey]);

  const sync = (next: CartItem[]) => {
    setItems(next);
    writeCartByKey(cartKey, next);
  };

  const addItem: CartContextValue["addItem"] = (product, qty, variant) => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) return;

    const incoming = toCartItem(product, n, variant);

    const next = [...items];
    const idx = next.findIndex(
      (x) => x.id === incoming.id && sameVariant(x.variant, incoming.variant),
    );

    if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity + n };
      sync(next);
      return;
    }

    next.push(incoming);
    sync(next);
  };

  const increase: CartContextValue["increase"] = (productId, variant) => {
    sync(
      items.map((x) =>
        x.id === productId && sameVariant(x.variant, variant)
          ? { ...x, quantity: x.quantity + 1 }
          : x,
      ),
    );
  };

  const decrease: CartContextValue["decrease"] = (productId, variant) => {
    sync(
      items.map((x) =>
        x.id === productId && sameVariant(x.variant, variant)
          ? { ...x, quantity: Math.max(1, x.quantity - 1) }
          : x,
      ),
    );
  };

  const removeItem: CartContextValue["removeItem"] = (productId, variant) => {
    sync(
      items.filter(
        (x) => !(x.id === productId && sameVariant(x.variant, variant)),
      ),
    );
  };

  const clear = () => sync([]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, increase, decrease, removeItem, clear, total }),
    [items, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}