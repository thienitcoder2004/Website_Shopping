export type CartVariant = {
  color?: string;
  size?: string;
};

export type CartItem = {
  id: string;          // productId (_id)
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;      // path /uploads/... hoặc full url
  variant?: CartVariant;
};

export type CartState = {
  items: CartItem[];
};
