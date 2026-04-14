import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GarmentConfig, Size, Material } from '@/lib/garments';
import { MATERIALS } from '@/lib/garments';
import type { PlacedImage, PriceBreakdown } from '@/lib/pricing';
import PriceDisplay from './PriceDisplay';
import { toast } from '@/hooks/use-toast';

interface DesignSummaryProps {
  garment: GarmentConfig;
  color: string;
  size: Size;
  material: Material;
  images: PlacedImage[];
  price: PriceBreakdown;
  onBack: () => void;
}

const DesignSummary = ({ garment, color, size, material, images, price, onBack }: DesignSummaryProps) => {
  const navigate = useNavigate();
  const materialName = MATERIALS.find(m => m.id === material)?.name ?? material;

  const handleSave = useCallback(() => {
    const design = {
      garment: garment.id,
      color,
      size,
      material,
      images,
      price,
      savedAt: new Date().toISOString(),
    };
    const saved = JSON.parse(localStorage.getItem('stitch_designs') || '[]');
    saved.push(design);
    localStorage.setItem('stitch_designs', JSON.stringify(saved));
    toast({ title: 'Design saved!', description: 'Your design has been saved to your browser.' });
  }, [garment, color, size, material, images, price]);

  const handleOrder = useCallback(() => {
    toast({
      title: 'Order placed! 🎉',
      description: `Your custom ${garment.name} order for $${price.total} has been submitted.`,
    });
  }, [garment, price]);

  const handleDownload = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({ title: 'Error', description: 'Could not find the design canvas.' });
      return;
    }
    const link = document.createElement('a');
    link.download = `stitch-${garment.id}-design.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast({ title: 'Downloaded!', description: 'Your design image has been downloaded.' });
  }, [garment]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back to Editor
          </button>
          <h1 className="font-display font-bold gradient-text">Design Summary</h1>
          <div />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="glass-card p-6 space-y-6">
          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Garment" value={garment.name} />
            <Detail label="Size" value={size} />
            <Detail label="Material" value={materialName} />
            <Detail label="Color">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: color }} />
                <span className="text-sm text-foreground">{color}</span>
              </div>
            </Detail>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div>
              <h4 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Uploaded Images ({images.length})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {images.map((img) => (
                  <div key={img.zone} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                    <img src={img.dataUrl} alt={img.zone} className="w-12 h-12 object-cover rounded" />
                    <span className="text-sm text-foreground capitalize">{img.zone.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <PriceDisplay breakdown={price} />

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleDownload}
              className="py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
            >
              📥 Download PNG
            </button>
            <button
              onClick={handleSave}
              className="py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
            >
              💾 Save Design
            </button>
            <button
              onClick={handleOrder}
              className="sm:col-span-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
            >
              🛒 Order Now — ${price.total}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      {children ?? <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>}
    </div>
  );
}

export default DesignSummary;
