export interface Cart {
  id: number;
  userId: string;
  createdAt: Date;
  items: CartItem[];
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product?: Product;
}