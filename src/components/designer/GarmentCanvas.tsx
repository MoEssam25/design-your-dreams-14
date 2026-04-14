import { useRef, useEffect, useState } from 'react';
import type { GarmentConfig, GarmentType, PlacementZone } from '@/lib/garments';
import type { PlacedImage } from '@/lib/pricing';

// Import all garment images
import tshirtFront from '@/assets/garments/tshirt-front.png';
import tshirtBack from '@/assets/garments/tshirt-back.png';
import hoodieFront from '@/assets/garments/hoodie-front.png';
import hoodieBack from '@/assets/garments/hoodie-back.png';
import jeansFront from '@/assets/garments/jeans-front.png';
import jeansBack from '@/assets/garments/jeans-back.png';
import jacketFront from '@/assets/garments/jacket-front.png';
import jacketBack from '@/assets/garments/jacket-back.png';
import capFront from '@/assets/garments/cap-front.png';
import capBack from '@/assets/garments/cap-back.png';

interface GarmentCanvasProps {
  garment: GarmentConfig;
  color: string;
  view: 'front' | 'back';
  images: PlacedImage[];
}

const GARMENT_IMAGES: Record<GarmentType, { front: string; back: string }> = {
  tshirt: { front: tshirtFront, back: tshirtBack },
  hoodie: { front: hoodieFront, back: hoodieBack },
  jeans: { front: jeansFront, back: jeansBack },
  jacket: { front: jacketFront, back: jacketBack },
  cap: { front: capFront, back: capBack },
};

// Image placement zones as pixel regions on 1024x1280 canvas (or 1024x1024 for cap)
// Format: [x, y, width, height] as fractions of image size
type ZoneMap = Partial<Record<PlacementZone, [number, number, number, number]>>;

const ZONE_MAPS: Record<GarmentType, { front: ZoneMap; back: ZoneMap }> = {
  tshirt: {
    front: {
      'chest': [0.3, 0.3, 0.4, 0.25],
      'left-sleeve': [0.08, 0.22, 0.17, 0.15],
      'right-sleeve': [0.75, 0.22, 0.17, 0.15],
    },
    back: {
      'back': [0.25, 0.22, 0.5, 0.35],
      'left-sleeve': [0.75, 0.22, 0.17, 0.15],
      'right-sleeve': [0.08, 0.22, 0.17, 0.15],
    },
  },
  hoodie: {
    front: {
      'chest': [0.3, 0.32, 0.4, 0.22],
      'left-sleeve': [0.06, 0.3, 0.18, 0.18],
      'right-sleeve': [0.76, 0.3, 0.18, 0.18],
    },
    back: {
      'back': [0.22, 0.25, 0.56, 0.35],
      'left-sleeve': [0.76, 0.3, 0.18, 0.18],
      'right-sleeve': [0.06, 0.3, 0.18, 0.18],
    },
  },
  jeans: {
    front: {
      'chest': [0.3, 0.15, 0.4, 0.18],
    },
    back: {
      'back': [0.3, 0.15, 0.4, 0.18],
    },
  },
  jacket: {
    front: {
      'chest': [0.28, 0.25, 0.44, 0.28],
      'left-sleeve': [0.05, 0.25, 0.18, 0.18],
      'right-sleeve': [0.77, 0.25, 0.18, 0.18],
    },
    back: {
      'back': [0.2, 0.2, 0.6, 0.38],
      'left-sleeve': [0.77, 0.25, 0.18, 0.18],
      'right-sleeve': [0.05, 0.25, 0.18, 0.18],
    },
  },
  cap: {
    front: {
      'chest': [0.25, 0.15, 0.5, 0.35],
    },
    back: {},
  },
};

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

const GarmentCanvas = ({ garment, color: garmentColor, view, images }: GarmentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);

  // Load base garment image
  useEffect(() => {
    const imgSrc = GARMENT_IMAGES[garment.id]?.[view];
    if (!imgSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setBaseImage(img);
    img.src = imgSrc;
  }, [garment.id, view]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw the garment base image
    ctx.drawImage(baseImage, 0, 0, w, h);

    // Apply color tint using multiply blend mode
    if (garmentColor !== '#ffffff') {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = garmentColor;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Restore alpha from original image
      ctx.save();
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(baseImage, 0, 0, w, h);
      ctx.restore();
    }

    // Get zones for current view
    const zones = ZONE_MAPS[garment.id]?.[view] ?? {};

    // Draw uploaded images on zones
    const visibleZones = Object.keys(zones) as PlacementZone[];
    let pendingImages = 0;

    visibleZones.forEach(zone => {
      const pos = zones[zone];
      if (!pos) return;
      const [rx, ry, rw, rh] = pos;

      const placedImage = images.find(i => i.zone === zone);
      if (placedImage) {
        pendingImages++;
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.drawImage(img, rx * w, ry * h, rw * w, rh * h);
          ctx.restore();
          pendingImages--;

          // Draw zone outlines after all images loaded
          if (pendingImages === 0) {
            drawZoneOutlines(ctx, zones, visibleZones, images, w, h);
          }
        };
        img.src = placedImage.dataUrl;
      }
    });

    // If no images to load, draw outlines immediately
    if (pendingImages === 0) {
      drawZoneOutlines(ctx, zones, visibleZones, images, w, h);
    }
  }, [baseImage, garmentColor, view, images, garment]);

  return (
    <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={512}
        height={garment.id === 'cap' ? 512 : 640}
        className="max-w-full h-auto max-h-[450px]"
      />
    </div>
  );
};

function drawZoneOutlines(
  ctx: CanvasRenderingContext2D,
  zones: ZoneMap,
  visibleZones: PlacementZone[],
  images: PlacedImage[],
  w: number,
  h: number
) {
  visibleZones.forEach(zone => {
    const pos = zones[zone];
    if (!pos) return;
    const [rx, ry, rw, rh] = pos;
    const hasImage = images.some(i => i.zone === zone);

    if (!hasImage) {
      // Draw dashed zone outline
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(255, 180, 50, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(rx * w, ry * h, rw * w, rh * h);
      ctx.restore();

      // Zone label
      ctx.save();
      ctx.fillStyle = 'rgba(255, 180, 50, 0.8)';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = zone === 'chest' ? 'CHEST' : zone === 'back' ? 'BACK' : zone === 'left-sleeve' ? 'L. SLEEVE' : 'R. SLEEVE';
      ctx.fillText(label, (rx + rw / 2) * w, (ry + rh / 2) * h);
      ctx.restore();
    }
  });
}

export default GarmentCanvas;
