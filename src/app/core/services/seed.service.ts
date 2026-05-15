/**
 * Seed data for Firestore. Run this once from a component or console to populate.
 * Images use Cloudinary demo account or can be replaced with your own cloud_name.
 *
 * Usage: inject SeedService and call seedAll()
 */
import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/firebase.config';
import { environment } from '../../../environments/environment';

const CLOUDINARY_BASE = `https://res.cloudinary.com/${environment.cloudinary.cloudName}/image/upload`;

@Injectable({ providedIn: 'root' })
export class SeedService {

  async seedAll(): Promise<void> {
    const productsRef = collection(firestore, 'products');
    const snap = await getDocs(productsRef);
    if (!snap.empty) {
      console.log('Firestore already seeded — skipping.');
      return;
    }

    await this.seedProducts();
    await this.seedCategories();
    await this.seedTestimonials();
    await this.seedConfig();
    await this.seedAdminUser();
    console.log('✅ Firestore seeded successfully!');
  }

  private async seedAdminUser(): Promise<void> {
    const adminEmail = 'anshadcontacts@gmail.com';
    // We use a fixed UID for the seeded admin for consistency, 
    // or we could search for the user by email if they already registered.
    // For now, we'll create a document in 'users' collection.
    await setDoc(doc(firestore, 'users', 'admin_anshad'), {
      email: adminEmail,
      displayName: 'Admin Anshad',
      role: 'admin',
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0
    });
    console.log('Seeded admin user metadata to Firestore');
  }

  private async seedProducts(): Promise<void> {
    const products = [
      {
        name: 'Premium Green Cardamom',
        description: 'Hand-sorted, bold green pods from Idukki hills with intense aroma and rich flavor. Perfect for biryani, desserts, and chai.',
        shortDescription: 'Bold green pods from Idukki hills',
        price: 1299,
        originalPrice: 1599,
        category: 'Cardamom',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/spices.jpg`,
        images: [],
        stock: 150,
        rating: 5,
        reviews: 248,
        badge: 'Bestseller',
        isActive: true,
        isFeatured: true,
        weight: '100g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Cardamom Powder',
        description: 'Freshly ground cardamom powder for authentic flavor in every dish. Stone-ground to preserve volatile oils.',
        shortDescription: 'Freshly ground for authentic flavor',
        price: 899,
        originalPrice: 1099,
        category: 'Organic Powders',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/pot-mussels.jpg`,
        images: [],
        stock: 200,
        rating: 4,
        reviews: 182,
        badge: 'New',
        isActive: true,
        isFeatured: true,
        weight: '50g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Kerala Garam Masala',
        description: 'A royal blend of 12 handpicked spices for the perfect curry. Roasted and ground fresh for maximum fragrance.',
        shortDescription: 'Royal blend of 12 handpicked spices',
        price: 449,
        originalPrice: 549,
        category: 'Whole Spices',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/fish-vegetables.jpg`,
        images: [],
        stock: 300,
        rating: 5,
        reviews: 326,
        badge: 'Popular',
        isActive: true,
        isFeatured: true,
        weight: '100g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Organic Black Pepper',
        description: 'Bold, pungent whole black peppercorns from Wayanad plantations. Sun-dried for maximum heat.',
        shortDescription: 'Pungent peppercorns from Wayanad',
        price: 599,
        originalPrice: 699,
        category: 'Whole Spices',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/dessert.jpg`,
        images: [],
        stock: 250,
        rating: 4,
        reviews: 154,
        badge: 'Organic',
        isActive: true,
        isFeatured: true,
        weight: '100g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Clove Premium',
        description: 'Aromatic whole cloves with rich essential oil content. Hand-harvested from mature trees for peak potency.',
        shortDescription: 'Aromatic cloves with rich oil content',
        price: 799,
        originalPrice: 999,
        category: 'Whole Spices',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/landscapes/nature-mountains.jpg`,
        images: [],
        stock: 120,
        rating: 5,
        reviews: 97,
        badge: '',
        isActive: true,
        isFeatured: true,
        weight: '50g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'Cinnamon Sticks',
        description: 'True Ceylon cinnamon sticks with delicate, sweet flavor profile. Perfect for desserts and hot beverages.',
        shortDescription: 'True Ceylon cinnamon, sweet & delicate',
        price: 349,
        originalPrice: 449,
        category: 'Whole Spices',
        imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/fish-vegetables.jpg`,
        images: [],
        stock: 180,
        rating: 4,
        reviews: 203,
        badge: '',
        isActive: true,
        isFeatured: true,
        weight: '50g',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const p of products) {
      const docRef = doc(collection(firestore, 'products'));
      await setDoc(docRef, p);
    }
  }

  private async seedCategories(): Promise<void> {
    const categories = [
      { name: 'Cardamom', description: 'Premium green & black cardamom from Kerala hills', imageUrl: `${CLOUDINARY_BASE}/w_900,q_80,f_auto/samples/food/spices.jpg`, productCount: 12, isActive: true },
      { name: 'Whole Spices', description: 'Handpicked whole spices for authentic flavors', imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/fish-vegetables.jpg`, productCount: 24, isActive: true },
      { name: 'Organic Powders', description: 'Freshly ground spice powders', imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/dessert.jpg`, productCount: 18, isActive: true },
      { name: 'Tea Masala', description: 'Special blends for the perfect cup', imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/pot-mussels.jpg`, productCount: 8, isActive: true },
      { name: 'Export Quality', description: 'Premium grade spices for global markets', imageUrl: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/landscapes/nature-mountains.jpg`, productCount: 15, isActive: true },
    ];
    for (const c of categories) {
      const docRef = doc(collection(firestore, 'categories'));
      await setDoc(docRef, c);
    }
  }

  private async seedTestimonials(): Promise<void> {
    const testimonials = [
      { name: 'Priya Nair', location: 'Mumbai, India', rating: 5, text: 'The cardamom quality is unmatched! The aroma fills my entire kitchen. AQDAS has become my go-to brand for all spices.', avatarUrl: '' },
      { name: 'Rajesh Kumar', location: 'Delhi, India', rating: 5, text: 'Best garam masala I have ever used. The freshness and flavor are extraordinary. Highly recommend to every home chef!', avatarUrl: '' },
      { name: 'Fatima Hassan', location: 'Bangalore, India', rating: 5, text: 'I have been buying cardamom from AQDAS for over a year now. The consistency in quality is remarkable. Worth every penny.', avatarUrl: '' },
      { name: 'Amit Sharma', location: 'Hyderabad, India', rating: 4, text: 'Premium packaging, fresh spices, and fast delivery. AQDAS delivers on their promise of farm-to-kitchen quality.', avatarUrl: '' },
      { name: 'Lakshmi Menon', location: 'Kochi, India', rating: 5, text: 'Being from Kerala myself, I can vouch for the authenticity of AQDAS spices. They taste just like home.', avatarUrl: '' },
      { name: 'Sarah Johnson', location: 'London, UK', rating: 5, text: 'Finally found authentic Indian cardamom that ships internationally! The quality is outstanding.', avatarUrl: '' },
    ];
    for (const t of testimonials) {
      const docRef = doc(collection(firestore, 'testimonials'));
      await setDoc(docRef, t);
    }
  }

  private async seedConfig(): Promise<void> {
    await setDoc(doc(firestore, 'config', 'site'), {
      offerTitle: 'Get 20% OFF',
      offerSubtitle: 'on Your First Order',
      offerCode: 'AQDAS20',
      offerDiscount: 20,
      offerEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      stats: [
        { value: '500+', label: 'Products' },
        { value: '10K+', label: 'Customers' },
        { value: '100%', label: 'Organic' },
      ],
      heroTitle: 'Pure Kerala Cardamom',
      heroSubtitle: 'Handpicked premium organic spices from the lush green hills of Kerala, delivered fresh to your kitchen.',
      heroImage: `${CLOUDINARY_BASE}/w_600,q_80,f_auto/samples/food/spices.jpg`,
    });
  }
}
