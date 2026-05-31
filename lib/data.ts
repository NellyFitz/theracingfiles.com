import type { Product, Creator, Category } from './types';

export const creators: Creator[] = [
  {
    id: 'creator-1',
    name: 'Jake Moreno',
    handle: 'revlimitdesigns',
    avatar: '',
    bio: 'FSAE alum. Designs aero and body components with a focus on real-world printability. Every part tested on track before listing.',
    partCount: 34,
    sales: 1240,
    rating: 4.9,
    badges: ['Top Seller', 'Verified Creator', 'Aero Specialist'],
    joinDate: '2024-01',
  },
  {
    id: 'creator-2',
    name: 'Mia Tanaka',
    handle: 'mia.fab',
    avatar: '',
    bio: 'Motorcycle restoration specialist. Interior trim, fairings, and hard-to-find clips for vintage and modern bikes.',
    partCount: 18,
    sales: 670,
    rating: 4.8,
    badges: ['Moto Specialist', 'Verified Creator'],
    joinDate: '2024-03',
  },
  {
    id: 'creator-3',
    name: 'Darius Webb',
    handle: 'tacoma_darius',
    avatar: '',
    bio: 'Tacoma and off-road truck enthusiast. Bed organizers, MOLLE panels, trail gear, and overland accessories.',
    partCount: 22,
    sales: 890,
    rating: 4.7,
    badges: ['Off-Road Specialist', 'Community Favorite'],
    joinDate: '2023-11',
  },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    slug: 'na-miata-ducktail-spoiler',
    name: 'NA Miata Ducktail Spoiler',
    shortName: 'NA Miata Ducktail',
    category: 'Aero & Body',
    vehicleType: 'Car',
    make: 'Mazda',
    model: 'Miata NA',
    yearStart: 1990,
    yearEnd: 1997,
    fitment: '1990–1997 Mazda Miata NA',
    filePrice: 24,
    printedPrice: 119,
    finishedAvailable: true,
    fileTypes: ['STL', '3MF'],
    material: 'ASA or PETG-CF',
    difficulty: 'Intermediate',
    badges: [
      { type: 'verified', label: 'Verified Fitment' },
      { type: 'community', label: 'Community Tested' },
    ],
    imageUrl: '',
    creatorId: 'creator-1',
    rating: 4.9,
    reviewCount: 47,
    description:
      'Ducktail-style spoiler designed specifically for the NA Miata trunk lid. Provides modest downforce without exceeding factory trunk strut ratings. Low profile, aggressive aesthetic. Splits into two sections for easier printing on standard bed sizes.',
    fitmentNotes:
      'Fits 1990–1997 Mazda MX-5 Miata (NA). Will NOT fit NB, NC, or ND. Verify trunk lid is undamaged before installation. Template included for mounting hole locations.',
    printSettings: {
      layerHeight: '0.2mm',
      infill: '30%',
      supports: true,
      bedTemp: '90°C (ASA)',
      nozzleTemp: '240°C (ASA)',
      material: 'ASA recommended for UV resistance. PETG-CF for added stiffness.',
    },
    installNotes:
      'Dry-fit before drilling. Use M4 hardware. Template PDF included. Recommended: 3M VHB tape as primary adhesion with two M4 bolts as secondary. Sand mating surface with 220 grit before bonding.',
    tags: ['miata', 'na', 'aero', 'spoiler', 'ducktail', 'jdm'],
    featured: true,
  },
  {
    id: 'prod-2',
    slug: 'r32-gtr-interior-vent',
    name: 'R32 GTR Interior Vent Surround',
    shortName: 'R32 GTR Interior Vent',
    category: 'Interior',
    vehicleType: 'Car',
    make: 'Nissan',
    model: 'Skyline R32 GTR',
    yearStart: 1989,
    yearEnd: 1994,
    fitment: '1989–1994 Nissan Skyline R32 GTR',
    filePrice: 18,
    printedPrice: 69,
    finishedAvailable: false,
    fileTypes: ['STL', '3MF'],
    material: 'PETG or ABS',
    difficulty: 'Beginner',
    badges: [
      { type: 'community', label: 'Community Tested' },
    ],
    imageUrl: '',
    creatorId: 'creator-1',
    rating: 4.7,
    reviewCount: 23,
    description:
      'Replacement vent surround for R32 GTR center console. OEM part discontinued. Snap-fit design requires no hardware. Textured surface to match factory grain.',
    fitmentNotes:
      'R32 GTR only. Verify console trim code on part. LHD and RHD variants included in file pack.',
    printSettings: {
      layerHeight: '0.15mm',
      infill: '25%',
      supports: false,
      bedTemp: '70°C (PETG)',
      nozzleTemp: '230°C (PETG)',
      material: 'PETG for heat resistance. ABS for closer OEM color match.',
    },
    installNotes:
      'Remove factory vent. Clean snap clips. Press fit new surround. No tools required.',
    tags: ['r32', 'skyline', 'gtr', 'interior', 'jdm', 'vent'],
    featured: true,
  },
  {
    id: 'prod-3',
    slug: 'tacoma-molle-panel',
    name: 'Tacoma Rear Quarter MOLLE Panel',
    shortName: 'Tacoma MOLLE Panel',
    category: 'Truck & Off-Road',
    vehicleType: 'Truck',
    make: 'Toyota',
    model: 'Tacoma',
    yearStart: 2016,
    yearEnd: 2023,
    fitment: '2016–2023 Toyota Tacoma (3rd Gen) Double Cab',
    filePrice: 22,
    printedPrice: 99,
    finishedAvailable: true,
    fileTypes: ['STL', '3MF', 'STEP'],
    material: 'PETG-CF or Nylon-CF',
    difficulty: 'Intermediate',
    badges: [
      { type: 'verified', label: 'Verified Fitment' },
      { type: 'community', label: 'Community Tested' },
    ],
    imageUrl: '',
    creatorId: 'creator-3',
    rating: 4.8,
    reviewCount: 61,
    description:
      'Drop-in MOLLE panel for 3rd gen Tacoma rear quarter trim. Replaces OEM panel with a mil-spec MOLLE grid for attaching pouches, organizers, and accessories. No permanent modification required.',
    fitmentNotes:
      'Fits 2016–2023 Tacoma Double Cab only. Access Cab has different dimensions. STEP file included for custom modifications.',
    printSettings: {
      layerHeight: '0.2mm',
      infill: '40%',
      supports: false,
      bedTemp: '70°C',
      nozzleTemp: '245°C',
      material: 'PETG-CF strongly recommended. Nylon-CF for maximum strength.',
    },
    installNotes:
      'Remove OEM panel (4 clips). Panel is split into 3 sections. Join with M3 hardware included in pack. Reinstall using factory clip points.',
    tags: ['tacoma', 'toyota', 'molle', 'offroad', 'truck', 'overland'],
    featured: true,
  },
  {
    id: 'prod-4',
    slug: 'yamaha-r6-fairing-clip',
    name: 'Yamaha R6 Fairing Clip Set',
    shortName: 'Yamaha R6 Fairing Clip',
    category: 'Motorcycle',
    vehicleType: 'Motorcycle',
    make: 'Yamaha',
    model: 'YZF-R6',
    yearStart: 2006,
    yearEnd: 2016,
    fitment: '2006–2016 Yamaha YZF-R6',
    filePrice: 8,
    printedPrice: 29,
    finishedAvailable: false,
    fileTypes: ['STL'],
    material: 'PETG or Nylon',
    difficulty: 'Beginner',
    badges: [
      { type: 'community', label: 'Community Tested' },
    ],
    imageUrl: '',
    creatorId: 'creator-2',
    rating: 4.6,
    reviewCount: 89,
    description:
      'Set of 12 fairing clips that are commonly cracked or missing. OEM clips are overpriced. This set prints in under 2 hours total and fits like factory.',
    fitmentNotes: 'Fits 2006–2016 R6. Includes all clip types used on lower and mid fairings.',
    printSettings: {
      layerHeight: '0.15mm',
      infill: '60%',
      supports: false,
      bedTemp: '70°C',
      nozzleTemp: '235°C',
      material: 'PETG for balance of flex and strength. Nylon for higher vibration resistance.',
    },
    installNotes: 'Push clip into fairing hole until audible click. Replace as needed.',
    tags: ['yamaha', 'r6', 'moto', 'fairing', 'clip', 'sportbike'],
    featured: false,
  },
  {
    id: 'prod-5',
    slug: 'miata-hardtop-side-latch',
    name: 'NA/NB Miata Hardtop Side Latch',
    shortName: 'Miata Hardtop Side Latch',
    category: 'Exterior',
    vehicleType: 'Car',
    make: 'Mazda',
    model: 'Miata NA/NB',
    yearStart: 1990,
    yearEnd: 2005,
    fitment: '1990–2005 Mazda Miata NA & NB',
    filePrice: 12,
    printedPrice: 44,
    finishedAvailable: false,
    fileTypes: ['STL', '3MF'],
    material: 'ASA or Nylon PA12',
    difficulty: 'Intermediate',
    badges: [
      { type: 'verified', label: 'Verified Fitment' },
    ],
    imageUrl: '',
    creatorId: 'creator-1',
    rating: 4.8,
    reviewCount: 32,
    description:
      'Replacement hardtop side latch for NA and NB Miata. OEM part discontinued. Designed with reinforced pivot points for long-term use.',
    fitmentNotes: 'Fits NA (1990–1997) and NB (1999–2005) with factory hardtop. Verify latch body dimensions against template.',
    printSettings: {
      layerHeight: '0.2mm',
      infill: '50%',
      supports: true,
      bedTemp: '90°C (ASA)',
      nozzleTemp: '245°C (ASA)',
      material: 'ASA required for UV/heat. Nylon PA12 for maximum flex strength.',
    },
    installNotes: 'Insert M5 pivot bolt through printed body. Torque to 3Nm. Test latch engagement before driving.',
    tags: ['miata', 'na', 'nb', 'hardtop', 'latch', 'exterior'],
    featured: false,
  },
  {
    id: 'prod-6',
    slug: 'ducati-phone-mount',
    name: 'Ducati Monster Phone & GPS Mount',
    shortName: 'Ducati Phone Mount',
    category: 'Motorcycle',
    vehicleType: 'Motorcycle',
    make: 'Ducati',
    model: 'Monster 821 / 1200',
    yearStart: 2014,
    yearEnd: 2021,
    fitment: '2014–2021 Ducati Monster 821 & 1200',
    filePrice: 10,
    printedPrice: 38,
    finishedAvailable: false,
    fileTypes: ['STL', '3MF'],
    material: 'PETG-CF',
    difficulty: 'Beginner',
    badges: [
      { type: 'prototype', label: 'Prototype' },
    ],
    imageUrl: '',
    creatorId: 'creator-2',
    rating: 4.3,
    reviewCount: 14,
    description:
      'Handlebar-mounted phone/GPS bracket for Ducati Monster. Clamps to 22mm bar ends. Adjustable tilt. RAM mount compatible interface.',
    fitmentNotes: 'Fits 22mm bars. Compatible with Quadlock and RAM mount adapter plates.',
    printSettings: {
      layerHeight: '0.2mm',
      infill: '45%',
      supports: false,
      bedTemp: '70°C',
      nozzleTemp: '245°C',
      material: 'PETG-CF required for vibration resistance.',
    },
    installNotes: 'Slide onto bar end. Tighten M4 clamp bolt to 2Nm. Do not overtighten on CF bars.',
    tags: ['ducati', 'monster', 'moto', 'phone', 'mount', 'gps'],
    featured: false,
  },
];

export const categories: Category[] = [
  { id: 'miata', name: 'Miata', icon: '🏎️', count: 47, description: 'NA, NB, NC, ND — the full lineup' },
  { id: 'jdm', name: 'Skyline / JDM', icon: '⚡', count: 38, description: 'R32, R33, R34, AE86 & more' },
  { id: 'moto', name: 'Sport Bikes', icon: '🏍️', count: 54, description: 'Fairings, clips, mounts & accessories' },
  { id: 'truck', name: 'Tacoma / Off-road', icon: '🛻', count: 62, description: 'MOLLE, bed organizers & trail gear' },
  { id: 'interior', name: 'Interior Clips', icon: '🔧', count: 120, description: 'Discontinued OEM clips, tabs & trim' },
  { id: 'aero', name: 'Aero & Body', icon: '💨', count: 29, description: 'Splitters, diffusers, spoilers & lips' },
  { id: 'tools', name: 'Garage Tools', icon: '🔩', count: 83, description: 'Jigs, holders, stands & shop tools' },
];

export const getFeaturedProducts = (): Product[] =>
  products.filter((p) => p.featured);

export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

export const getCreatorById = (id: string): Creator | undefined =>
  creators.find((c) => c.id === id);

export const filterProducts = (
  allProducts: Product[],
  filters: {
    search?: string;
    vehicleType?: string;
    make?: string;
    category?: string;
    verifiedOnly?: boolean;
    printedAvailable?: boolean;
  }
): Product[] => {
  return allProducts.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.make.toLowerCase().includes(q) &&
        !p.model.toLowerCase().includes(q) &&
        !p.tags.some((t) => t.includes(q))
      )
        return false;
    }
    if (filters.vehicleType && filters.vehicleType !== 'All' && p.vehicleType !== filters.vehicleType) return false;
    if (filters.make && filters.make !== 'All' && p.make !== filters.make) return false;
    if (filters.category && filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.verifiedOnly && !p.badges.some((b) => b.type === 'verified')) return false;
    if (filters.printedAvailable && !p.printedPrice) return false;
    return true;
  });
};
