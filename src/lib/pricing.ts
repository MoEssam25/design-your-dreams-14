import type { GarmentConfig, Size, Material } from './garments';
import { MATERIALS } from './garments';

export interface PlacedImage {
  zone: string;
  dataUrl: string;
}

export interface PriceBreakdown {
  base: number;
  sizeExtra: number;
  materialExtra: number;
  imageExtra: number;
  backPrintExtra: number;
  total: number;
}

export function calculatePrice(
  garment: GarmentConfig,
  size: Size,
  material: Material,
  images: PlacedImage[]
): PriceBreakdown {
  const base = garment.basePrice;
  const sizeExtra = (size === 'XL' || size === 'XXL') ? 3 : 0;
  const mat = MATERIALS.find(m => m.id === material);
  const materialExtra = mat?.priceExtra ?? 0;
  const additionalImages = Math.max(0, images.length - 1);
  const imageExtra = additionalImages * 2;
  const hasBackPrint = images.some(img => img.zone === 'back');
  const backPrintExtra = hasBackPrint ? 2 : 0;

  return {
    base,
    sizeExtra,
    materialExtra,
    imageExtra,
    backPrintExtra,
    total: base + sizeExtra + materialExtra + imageExtra + backPrintExtra,
  };
}
