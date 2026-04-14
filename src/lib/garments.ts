export type GarmentType = 'tshirt' | 'hoodie' | 'jeans' | 'jacket' | 'cap';

export type PlacementZone = 'chest' | 'back' | 'left-sleeve' | 'right-sleeve';

export interface GarmentConfig {
  id: GarmentType;
  name: string;
  nameAr: string;
  basePrice: number;
  icon: string;
  zones: PlacementZone[];
  colors: string[];
}

export const GARMENTS: GarmentConfig[] = [
  {
    id: 'tshirt',
    name: 'T-Shirt',
    nameAr: 'تي شيرت',
    basePrice: 20,
    icon: '👕',
    zones: ['chest', 'back', 'left-sleeve', 'right-sleeve'],
    colors: ['#ffffff', '#000000', '#1a1a2e', '#e94560', '#0f3460', '#16213e', '#533483', '#e07c24', '#2d6a4f', '#d4a373'],
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    nameAr: 'هودي',
    basePrice: 35,
    icon: '🧥',
    zones: ['chest', 'back', 'left-sleeve', 'right-sleeve'],
    colors: ['#2d2d2d', '#1a1a2e', '#ffffff', '#e94560', '#0f3460', '#533483', '#2d6a4f', '#8b5e3c'],
  },
  {
    id: 'jeans',
    name: 'Jeans / Pants',
    nameAr: 'جينز / بنطلون',
    basePrice: 30,
    icon: '👖',
    zones: ['chest', 'back'],
    colors: ['#1a3a5c', '#0d253f', '#4a6fa5', '#2c2c2c', '#f5f0e6'],
  },
  {
    id: 'jacket',
    name: 'Jacket',
    nameAr: 'جاكيت',
    basePrice: 50,
    icon: '🧥',
    zones: ['chest', 'back', 'left-sleeve', 'right-sleeve'],
    colors: ['#000000', '#2d2d2d', '#8b4513', '#1a3a5c', '#2d6a4f', '#4a0e0e'],
  },
  {
    id: 'cap',
    name: 'Cap',
    nameAr: 'قبعة',
    basePrice: 15,
    icon: '🧢',
    zones: ['chest'],
    colors: ['#000000', '#ffffff', '#1a1a2e', '#e94560', '#0f3460', '#2d6a4f', '#e07c24'],
  },
];

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export type Material = 'cotton' | 'polyester' | 'denim' | 'wool' | 'linen';

export interface MaterialOption {
  id: Material;
  name: string;
  nameAr: string;
  priceExtra: number;
}

export const MATERIALS: MaterialOption[] = [
  { id: 'cotton', name: 'Cotton', nameAr: 'قطن', priceExtra: 0 },
  { id: 'polyester', name: 'Polyester', nameAr: 'بوليستر', priceExtra: 2 },
  { id: 'denim', name: 'Denim', nameAr: 'دنيم', priceExtra: 5 },
  { id: 'wool', name: 'Wool', nameAr: 'صوف', priceExtra: 8 },
  { id: 'linen', name: 'Linen', nameAr: 'كتان', priceExtra: 6 },
];
