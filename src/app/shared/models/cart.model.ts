/** Single cart item */
export interface CartItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  weight: string;
}

/** Wishlist item */
export interface WishlistItem {
  productId: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  addedAt: string;
}
