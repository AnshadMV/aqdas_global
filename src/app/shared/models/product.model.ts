/**
 * Product model — matches the Firestore `products` collection schema.
 * Images use Cloudinary URLs stored as strings.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  category: string;
  imageUrl: string;        // Cloudinary URL
  images: string[];        // Additional Cloudinary URLs
  stock: number;
  rating: number;
  reviews: number;
  badge: string;           // e.g. 'Bestseller', 'New', 'Organic'
  isActive: boolean;
  isFeatured: boolean;
  weight: string;          // e.g. '100g', '250g'
  createdAt: string;
  updatedAt: string;
}

/** Category model — matches the Firestore `categories` collection */
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  isActive: boolean;
}

/** Banner/hero content from Firestore `banners` collection */
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

/** Testimonial from Firestore `testimonials` collection */
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatarUrl: string;
}

/** Site config from Firestore `config` collection */
export interface SiteConfig {
  offerTitle: string;
  offerSubtitle: string;
  offerCode: string;
  offerDiscount: number;
  offerEndDate: string;
  stats: { value: string; label: string }[];
}
