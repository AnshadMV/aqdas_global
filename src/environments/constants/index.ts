export interface HeroContent {
  eyebrow: string;
  title: {
    line1: string;
    italicPart: string;
    accentPart: string;
  };
  subtitle: string;
  benefits: string[];
  primaryCta: {
    text: string;
    link: string;
  };
  secondaryCta: {
    text: string;
    link: string;
  };
  socialProof: {
    rating: string;
    label: string;
    avatars: string[];
  };
  mainCard: {
    image: string;
    label: string;
    title: string;
    subtitle: string;
  };
  secondaryCard: {
    image: string;
    label: string;
    title: string;
  };
  offerBadge: {
    label: string;
    value: string;
    suffix: string;
    subtext: string;
  };
  certBadge: {
    title: string;
    subtitle: string;
  };
}

export interface AboutContent {
  eyebrow: string;
  title: {
    line1: string;
    italicPart: string;
    accentPart: string;
  };
  subtitle: string;
  steps: {
    num: string;
    title: string;
    desc: string;
  }[];
  stats: {
    value: string;
    label: string;
  }[];
  primaryCta: {
    text: string;
    link: string;
  };
  secondaryCta: {
    text: string;
    link: string;
  };
  yearsBadge: {
    num: string;
    suffix: string;
    label: string;
  };
  certifiedChip: {
    title: string;
    subtitle: string;
  };
  mainImage: {
    image: string;
    captionLabel: string;
    captionTitle: string;
  };
  secondaryImage: {
    image: string;
    captionLabel: string;
    captionTitle: string;
  };
}

export interface PremiumCategory {
  id: string;
  name: string;
  image: string;
  secondaryImage: string;
  description: string;
  metrics: string;
  badge: string;
}

export interface CategoriesContent {
  eyebrow: string;
  title: {
    main: string;
    accent: string;
  };
  subtitle: string;
  panelTitle: string;
  categories: PremiumCategory[];
}

export interface FeaturedContent {
  eyebrow: string;
  title: {
    main: string;
    accent: string;
  };
  subtitle: string;
  catalogBtnText: string;
  catalogBtnLink: string;
}

export interface TestimonialsContent {
  eyebrow: string;
  title: {
    main: string;
    accent: string;
  };
  subtitle: string;
  featuredPortrait: string;
}

export interface OfferContent {
  eyebrow: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCode: string;
  trustStrip: {
    text: string;
    iconType: 'secure' | 'shipping' | 'returns';
  }[];
}

export interface GalleryItem {
  image: string;
  title: string;
  tag: string;
  desc: string;
}

export interface GalleryContent {
  eyebrow: string;
  title: {
    main: string;
    accent: string;
  };
  subtitle: string;
  items: GalleryItem[];
}

export interface HomeContent {
  hero: HeroContent;
  about: AboutContent;
  categories: CategoriesContent;
  featured: FeaturedContent;
  testimonials: TestimonialsContent;
  offer: OfferContent;
  gallery: GalleryContent;
}

export const HOME_CONTENT: HomeContent = {
  hero: {
    eyebrow: 'Pure Kerala Origin',
    title: {
      line1: 'Elevate',
      italicPart: 'Artistry with',
      accentPart: 'Premium Spices',
    },
    subtitle: "Directly sourced from the pristine hills of Idukki, our spices deliver the unmatched aroma and purity of Kerala's finest soil to your kitchen.",
    benefits: [
      'Directly Sourced from Idukki Hills',
      '100% Certified Organic and Pure',
      'Maximum Essential Oils Retained',
      'Aroma-Lock Eco Packaging',
    ],
    primaryCta: {
      text: 'Explore Shop',
      link: '/shop',
    },
    secondaryCta: {
      text: 'Our Heritage Story',
      link: '/about',
    },
    socialProof: {
      rating: '4.9/5',
      label: 'Favored by 2,000+ gourmet kitchens and chefs',
      avatars: [
        'https://i.pravatar.cc/100?img=12',
        'https://i.pravatar.cc/100?img=33',
        'https://i.pravatar.cc/100?img=47',
      ],
    },
    mainCard: {
      image: 'https://images.unsplash.com/photo-1721912997103-80662d6366c7?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      label: 'Best Seller',
      title: 'Green Cardamom',
      subtitle: 'Extra Bold | Idukki Gold',
    },
    secondaryCard: {
      image: 'https://images.unsplash.com/photo-1656568804517-435ef94bcc41?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      label: 'Signature Spices',
      title: 'Malabar Black Pepper',
    },
    offerBadge: {
      label: 'Special Offer',
      value: '20',
      suffix: '% OFF',
      subtext: 'Direct Orders',
    },
    certBadge: {
      title: 'Spices Board',
      subtitle: 'Certified Export Quality',
    },
  },
  about: {
    eyebrow: 'OUR HERITAGE NARRATIVE',
    title: {
      line1: 'Honoring Spices',
      italicPart: 'in',
      accentPart: 'Their Purest Form',
    },
    subtitle: 'We refined this section for faster scanning, stronger visual hierarchy, and cleaner spacing while preserving the brand story behind AQDAS.',
    steps: [
      {
        num: '01',
        title: 'Direct Legacy Sourcing',
        desc: 'AQDAS works closely with small-holder estates across Idukki to secure fair trade relationships and the strongest harvest selections.',
      },
      {
        num: '02',
        title: 'Traditional Solar Dehydration',
        desc: 'Our drying process protects aroma and essential oils while avoiding smoky aftertastes or aggressive heat treatment.',
      },
      {
        num: '03',
        title: 'Uncompromised Purity Promise',
        desc: 'No adulterants, added colors, or preservatives. We keep the experience whole, traceable, and clean from farm to kitchen.',
      },
    ],
    stats: [
      { value: '25+', label: 'Years' },
      { value: '2k+', label: 'Kitchens' },
      { value: '100%', label: 'Organic' },
      { value: '4.9★', label: 'Rated' },
    ],
    primaryCta: {
      text: 'Explore Shop',
      link: '/shop',
    },
    secondaryCta: {
      text: 'Our Full Story',
      link: '/about',
    },
    yearsBadge: {
      num: '25',
      suffix: '+',
      label: 'Years of\nHarvest Integrity',
    },
    certifiedChip: {
      title: 'Spices Board',
      subtitle: 'Certified Export',
    },
    mainImage: {
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      captionLabel: 'Western Ghats Estate',
      captionTitle: 'Idukki Gold Selection',
    },
    secondaryImage: {
      image: 'https://images.unsplash.com/photo-1523955845527-baa107a45dd6?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      captionLabel: 'Process',
      captionTitle: 'Chemical-Free Organic',
    },
  },
  categories: {
    eyebrow: 'ELITE SPICE CATALOG',
    title: {
      main: 'Taste the',
      accent: 'Extraordinary',
    },
    subtitle: "Every pinch of AQDAS reflects sustainable agriculture, organic handpicking, and meticulous grading from Kerala's spice estates.",
    panelTitle: 'Explore Categories',
    categories: [
      {
        id: '1',
        name: 'Premium Cardamom',
        image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
        secondaryImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=70',
        description: 'Sourced from the premium high-altitude valleys of Idukki and hand-sorted for bold size, rich color, and lasting aroma.',
        metrics: 'Camphor High | Moisture under 12%',
        badge: 'BESTSELLER GRADE A',
      },
      {
        id: '2',
        name: 'Tellicherry Black Pepper',
        image: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80',
        secondaryImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=70',
        description: 'Hand-picked dried peppercorns with robust heat, citrus undertones, and the clean finish prized by serious cooks.',
        metrics: 'Piperine above 5.5% | Handpicked',
        badge: 'SUN DRIED NATURAL',
      },
      {
        id: '3',
        name: 'True Ceylon Cinnamon',
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
        secondaryImage: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=300&q=70',
        description: 'Paper-thin quills prepared by skilled local craftsmen with sweet woody notes and a naturally refined profile.',
        metrics: 'Low Coumarin | Artisanal Finish',
        badge: 'ORGANICALLY GROWN',
      },
      {
        id: '4',
        name: 'Aromatic Cloves',
        image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
        secondaryImage: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=300&q=70',
        description: 'Legacy-estate clove buds harvested before bloom to preserve deep spice aroma and a rich essential-oil profile.',
        metrics: 'Eugenol above 18% | Plump Buds',
        badge: 'AROMA-LOCK SORTED',
      },
    ],
  },
  featured: {
    eyebrow: 'PURE PREMIUM QUALITY',
    title: {
      main: 'Featured',
      accent: 'Best Sellers',
    },
    subtitle: 'Handpicked, graded, and packed to lock in freshness. Discover a cleaner, more balanced showcase of AQDAS favorites.',
    catalogBtnText: 'View Full Catalog',
    catalogBtnLink: '/shop',
  },
  testimonials: {
    eyebrow: 'Trusted Globally',
    title: {
      main: 'Praised by',
      accent: 'Culinary Masters',
    },
    subtitle: 'Reviews from gourmet kitchens, professional chefs, and home cooks who trust AQDAS for their finest culinary moments.',
    featuredPortrait: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80',
  },
  offer: {
    eyebrow: 'Limited Time Offer',
    defaultTitle: 'Get 20% OFF',
    defaultSubtitle: 'on Your First Order',
    defaultCode: 'AQDAS20',
    trustStrip: [
      { text: 'Secure Checkout', iconType: 'secure' },
      { text: 'Free Shipping ₹999+', iconType: 'shipping' },
      { text: 'Easy Returns', iconType: 'returns' },
    ],
  },
  gallery: {
    eyebrow: 'The Spice Journey',
    title: {
      main: 'Follow the',
      accent: 'Harvest Story',
    },
    subtitle: 'A glimpse into pristine high-altitude farms, hand-graded selection steps, and the pure organic lifecycle of AQDAS spices.',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
        title: 'Drying Cardamom Pods',
        tag: 'Estate Sorting',
        desc: 'Sorted handpicked green cardamoms dried slowly in a smoke-free natural setup to preserve maximum chlorophyll and active natural oils.',
      },
      {
        image: 'https://images.unsplash.com/photo-1644057440075-3a5b077fe64d?q=80&w=1248&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        title: 'Tellicherry Black Pepper Sorting',
        tag: 'Sun-Drying Setup',
        desc: 'Selected peppercorns laid under uniform temperature setups. Plump berries dried to a rich wrinkled black shell bursting with piperine.',
      },
      {
        image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
        title: 'Artisanal Harvesting Steps',
        tag: 'Sustainable Pick',
        desc: 'Spice harvesting carried out by hand at sunrise, preserving delicate branch stalks and harvesting only pods at absolute peak maturity.',
      },
      {
        image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
        title: 'Ceylon Cinnamon Quills',
        tag: 'Scraping Craftsmanship',
        desc: 'Fine internal bark of Ceylon trees scraped by hand by native specialists and layered tightly into paper-thin multi-roll quills.',
      },
      {
        image: 'https://media.istockphoto.com/id/1149599335/photo/indian-dry-spice-separate-box-in-kitchen-for-cooking-lot-of-flavor-in-vegetable.webp?a=1&b=1&s=612x612&w=0&k=20&c=TcHeD9ilVsZWJNb-CV1ttMSPKzqAqXLZFk3FUo7zTmg=',
        title: 'Pure Spice Packing',
        tag: 'Aroma-Lock Pack',
        desc: 'Spice batches sealed in specialized triple-layer organic foil containers, preventing loss of essential aromatherapy values.',
      },
    ],
  },
};

// ─── ADMIN CHANNELS CONSTANTS ───
export const ADMIN_ITEMS_PER_PAGE = 8;
export const ADMIN_PRODUCT_BADGES = ['', 'Bestseller', 'New', 'Organic', 'Sale'];
export const ADMIN_PRODUCT_TABS = ['All', 'Active', 'Draft'];

// ─── ADMIN BI DASHBOARD CONSTANTS ───
export const ADMIN_TOP_PRODUCTS = [
  { id: '1', name: 'Premium Green Cardamom (8mm)', category: 'Cardamom', sales: 342, revenue: 153900 },
  { id: '2', name: 'Organic Green Cardamom (Medium)', category: 'Cardamom', sales: 215, revenue: 86000 },
  { id: '3', name: 'Elachi Special Grade (7.5mm)', category: 'Elachi', sales: 188, revenue: 65800 },
  { id: '4', name: 'Bulk Cardamom Seeds', category: 'Seeds', sales: 94, revenue: 32900 },
  { id: '5', name: 'Cardamom Pods Powder', category: 'Powder', sales: 76, revenue: 22800 },
];

export const ADMIN_DONUT_CATEGORIES = [
  { label: 'Cardamom', percentage: 60, color: 'var(--theme-primary)' },
  { label: 'Elachi', percentage: 20, color: '#3b82f6' },
  { label: 'Seeds', percentage: 12, color: '#f59e0b' },
  { label: 'Powder', percentage: 8, color: '#10b981' },
];

export const ADMIN_CHART_DATA = {
  weekly: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [12000, 15000, 11500, 18000, 22000, 19500, 24300],
  },
  monthly: {
    labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    values: [85000, 92000, 78000, 112000],
  },
  annual: {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    values: [62000, 71000, 89000, 105000, 125000, 152000],
  }
};
