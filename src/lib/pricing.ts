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
  textExtra: number;
  total: number;
}

export function calculatePrice(
  garment: GarmentConfig,
  size: Size,
  material: Material,
  imageCount: number,
  textCount: number,
  hasBackPrint: boolean
): PriceBreakdown {
  const base = garment.basePrice;
  const sizeExtra = (size === 'XL' || size === 'XXL') ? 3 : 0;
  const mat = MATERIALS.find(m => m.id === material);
  const materialExtra = mat?.priceExtra ?? 0;
  const additionalImages = Math.max(0, imageCount - 1);
  const imageExtra = additionalImages * 2;
  const backPrintExtra = hasBackPrint ? 2 : 0;
  const additionalTexts = Math.max(0, textCount - 1);
  const textExtra = additionalTexts * 2;

  return {
    base,
    sizeExtra,
    materialExtra,
    imageExtra,
    backPrintExtra,
    textExtra,
    total: base + sizeExtra + materialExtra + imageExtra + backPrintExtra + textExtra,
  };
}
