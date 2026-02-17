import type { CartItem, CartState } from "../types/cart.type";

const KEY = "cart";

export function readCart(): CartState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as unknown;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as CartState).items)
    ) {
      return { items: [] };
    }

    return parsed as CartState;
  } catch {
    return { items: [] };
  }
}

export function writeCart(state: CartState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

export function sameLine(a: CartItem, b: CartItem) {
  return (
    a.id === b.id &&
    (a.variant?.color ?? "") === (b.variant?.color ?? "") &&
    (a.variant?.size ?? "") === (b.variant?.size ?? "")
  );
}
