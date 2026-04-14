import { useRef, useEffect } from 'react';
import type { GarmentConfig, PlacementZone } from '@/lib/garments';
import type { PlacedImage } from '@/lib/pricing';

interface GarmentCanvasProps {
  garment: GarmentConfig;
  color: string;
  view: 'front' | 'back';
  images: PlacedImage[];
}

// Zone positions relative to canvas (x%, y%, w%, h%) for front view
const FRONT_ZONES: Record<PlacementZone, [number, number, number, number]> = {
  'chest': [0.3, 0.25, 0.4, 0.25],
  'left-sleeve': [0.05, 0.2, 0.2, 0.2],
  'right-sleeve': [0.75, 0.2, 0.2, 0.2],
  'back': [0, 0, 0, 0],
};

const BACK_ZONES: Record<PlacementZone, [number, number, number, number]> = {
  'back': [0.2, 0.2, 0.6, 0.4],
  'chest': [0, 0, 0, 0],
  'left-sleeve': [0.75, 0.2, 0.2, 0.2],
  'right-sleeve': [0.05, 0.2, 0.2, 0.2],
};

const CAP_ZONES: Record<string, [number, number, number, number]> = {
  'chest': [0.25, 0.3, 0.5, 0.3],
};

const JEANS_ZONES: Record<string, [number, number, number, number]> = {
  'chest': [0.25, 0.1, 0.5, 0.2],
  'back': [0.25, 0.1, 0.5, 0.2],
};

function getZones(garmentId: string, view: 'front' | 'back') {
  if (garmentId === 'cap') return CAP_ZONES;
  if (garmentId === 'jeans') return JEANS_ZONES;
  return view === 'front' ? FRONT_ZONES : BACK_ZONES;
}

function drawGarment(
  ctx: CanvasRenderingContext2D,
  garmentId: string,
  color: string,
  view: 'front' | 'back',
  w: number,
  h: number
) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = color;
  ctx.strokeStyle = adjustBrightness(color, -30);
  ctx.lineWidth = 2;

  switch (garmentId) {
    case 'tshirt':
      drawTShirt(ctx, w, h, view);
      break;
    case 'hoodie':
      drawHoodie(ctx, w, h, view);
      break;
    case 'jeans':
      drawJeans(ctx, w, h);
      break;
    case 'jacket':
      drawJacket(ctx, w, h, view);
      break;
    case 'cap':
      drawCap(ctx, w, h);
      break;
  }
}

function drawTShirt(ctx: CanvasRenderingContext2D, w: number, h: number, view: 'front' | 'back') {
  ctx.beginPath();
  // Neckline
  const neckW = w * 0.15;
  ctx.moveTo(w * 0.35, h * 0.08);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.14 : 0.06), w * 0.65, h * 0.08);
  // Right shoulder & sleeve
  ctx.lineTo(w * 0.85, h * 0.15);
  ctx.lineTo(w * 0.85, h * 0.35);
  ctx.lineTo(w * 0.72, h * 0.35);
  // Right body
  ctx.lineTo(w * 0.72, h * 0.88);
  // Bottom
  ctx.lineTo(w * 0.28, h * 0.88);
  // Left body
  ctx.lineTo(w * 0.28, h * 0.35);
  ctx.lineTo(w * 0.15, h * 0.35);
  ctx.lineTo(w * 0.15, h * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Neckline detail
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h * 0.08);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.14 : 0.06), w * 0.65, h * 0.08);
  ctx.strokeStyle = adjustBrightness(color(ctx), -50);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = adjustBrightness(color(ctx), -30);
}

function drawHoodie(ctx: CanvasRenderingContext2D, w: number, h: number, view: 'front' | 'back') {
  ctx.beginPath();
  // Hood
  ctx.moveTo(w * 0.32, h * 0.05);
  ctx.quadraticCurveTo(w * 0.5, h * 0.0, w * 0.68, h * 0.05);
  ctx.lineTo(w * 0.7, h * 0.12);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.18 : 0.1), w * 0.3, h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.12);
  ctx.lineTo(w * 0.1, h * 0.2);
  ctx.lineTo(w * 0.1, h * 0.45);
  ctx.lineTo(w * 0.25, h * 0.42);
  ctx.lineTo(w * 0.25, h * 0.9);
  ctx.lineTo(w * 0.75, h * 0.9);
  ctx.lineTo(w * 0.75, h * 0.42);
  ctx.lineTo(w * 0.9, h * 0.45);
  ctx.lineTo(w * 0.9, h * 0.2);
  ctx.lineTo(w * 0.7, h * 0.12);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.18 : 0.1), w * 0.3, h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kangaroo pocket (front only)
  if (view === 'front') {
    ctx.beginPath();
    ctx.roundRect(w * 0.3, h * 0.55, w * 0.4, h * 0.15, 8);
    ctx.strokeStyle = adjustBrightness(color(ctx), -20);
    ctx.stroke();
  }
}

function drawJeans(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.beginPath();
  // Waistband
  ctx.moveTo(w * 0.25, h * 0.05);
  ctx.lineTo(w * 0.75, h * 0.05);
  ctx.lineTo(w * 0.75, h * 0.1);
  ctx.lineTo(w * 0.25, h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Left leg
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.1);
  ctx.lineTo(w * 0.5, h * 0.1);
  ctx.lineTo(w * 0.52, h * 0.45);
  ctx.lineTo(w * 0.55, h * 0.92);
  ctx.lineTo(w * 0.2, h * 0.92);
  ctx.lineTo(w * 0.22, h * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.1);
  ctx.lineTo(w * 0.75, h * 0.1);
  ctx.lineTo(w * 0.78, h * 0.45);
  ctx.lineTo(w * 0.8, h * 0.92);
  ctx.lineTo(w * 0.45, h * 0.92);
  ctx.lineTo(w * 0.48, h * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawJacket(ctx: CanvasRenderingContext2D, w: number, h: number, view: 'front' | 'back') {
  // Collar
  ctx.beginPath();
  ctx.moveTo(w * 0.33, h * 0.05);
  ctx.lineTo(w * 0.3, h * 0.12);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.16 : 0.08), w * 0.7, h * 0.12);
  ctx.lineTo(w * 0.67, h * 0.05);
  ctx.quadraticCurveTo(w * 0.5, h * 0.02, w * 0.33, h * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.moveTo(w * 0.3, h * 0.12);
  ctx.lineTo(w * 0.08, h * 0.18);
  ctx.lineTo(w * 0.08, h * 0.48);
  ctx.lineTo(w * 0.22, h * 0.45);
  ctx.lineTo(w * 0.22, h * 0.9);
  ctx.lineTo(w * 0.78, h * 0.9);
  ctx.lineTo(w * 0.78, h * 0.45);
  ctx.lineTo(w * 0.92, h * 0.48);
  ctx.lineTo(w * 0.92, h * 0.18);
  ctx.lineTo(w * 0.7, h * 0.12);
  ctx.quadraticCurveTo(w * 0.5, h * (view === 'front' ? 0.16 : 0.08), w * 0.3, h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Zipper line (front)
  if (view === 'front') {
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.14);
    ctx.lineTo(w * 0.5, h * 0.9);
    ctx.strokeStyle = adjustBrightness(color(ctx), -40);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawCap(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Brim
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.6, w * 0.4, h * 0.08, 0, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // Crown
  ctx.beginPath();
  ctx.moveTo(w * 0.15, h * 0.6);
  ctx.quadraticCurveTo(w * 0.15, h * 0.15, w * 0.5, h * 0.12);
  ctx.quadraticCurveTo(w * 0.85, h * 0.15, w * 0.85, h * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Button on top
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.14, 5, 0, Math.PI * 2);
  ctx.fillStyle = adjustBrightness(ctx.fillStyle as string, -30);
  ctx.fill();
}

function color(ctx: CanvasRenderingContext2D): string {
  return ctx.fillStyle as string;
}

function adjustBrightness(hex: string, amount: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const GarmentCanvas = ({ garment, color: garmentColor, view, images }: GarmentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw the garment
    drawGarment(ctx, garment.id, garmentColor, view, w, h);

    // Draw zone indicators
    const zones = getZones(garment.id, view);
    const visibleZones = view === 'front'
      ? garment.zones.filter(z => z !== 'back')
      : garment.zones.filter(z => z === 'back' || z === 'left-sleeve' || z === 'right-sleeve');

    visibleZones.forEach(zone => {
      const pos = zones[zone];
      if (!pos || (pos[2] === 0 && pos[3] === 0)) return;
      const [rx, ry, rw, rh] = pos;

      const placedImage = images.find(i => i.zone === zone);
      if (placedImage) {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.globalAlpha = 0.9;
          ctx.drawImage(img, rx * w, ry * h, rw * w, rh * h);
          ctx.restore();
        };
        img.src = placedImage.dataUrl;
      } else {
        // Draw zone outline
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx * w, ry * h, rw * w, rh * h);
        ctx.restore();

        // Zone label
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        const label = zone.replace('-', ' ');
        ctx.fillText(label, (rx + rw / 2) * w, (ry + rh / 2) * h + 4);
        ctx.restore();
      }
    });
  }, [garment, garmentColor, view, images]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="max-w-full h-auto"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  );
};

export default GarmentCanvas;
