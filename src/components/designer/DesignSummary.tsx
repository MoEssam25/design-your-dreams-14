import type { GarmentConfig, Size, Material } from '@/lib/garments';
import type { PlacedImage, PriceBreakdown } from '@/lib/pricing';
import type { FabricCanvasHandle } from './FabricCanvas';
import PriceDisplay from './PriceDisplay';
import { MATERIALS } from '@/lib/garments';
import { useToast } from '@/hooks/use-toast';
import type { RefObject } from 'react';

interface DesignSummaryProps {
  garment: GarmentConfig;
  color: string;
  size: Size;
  material: Material;
  images: PlacedImage[];
  price: PriceBreakdown;
  onBack: () => void;
  canvasRef?: RefObject<FabricCanvasHandle | null>;
}

const DesignSummary = ({ garment, color, size, material, price, onBack, canvasRef }: DesignSummaryProps) => {
  const { toast } = useToast();
  const matName = MATERIALS.find(m => m.id === material)?.name ?? material;

  const handleDownload = () => {
    const dataUrl = canvasRef?.current?.exportPNG();
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `stitch-studio-${garment.id}-design.png`;
      a.click();
      toast({ title: 'Design downloaded!' });
    }
  };

  const handleSave = () => {
    const json = canvasRef?.current?.getDesignJSON();
    const designs = JSON.parse(localStorage.getItem('stitch_designs_v2') || '[]');
    designs.push({ garment: garment.id, color, size, material, canvas: json, price, savedAt: new Date().toISOString() });
    localStorage.setItem('stitch_designs_v2', JSON.stringify(designs));
    toast({ title: 'Design saved!', description: 'You can reload it later.' });
  };

  const handleOrder = () => {
    toast({ title: 'Order placed!', description: `Total: $${price.total}. We will contact you soon.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-sm">&larr; Back to Editor</button>
          <h1 className="font-display font-bold gradient-text">DESIGN SUMMARY</h1>
          <div />
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="glass-card p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Garment" value={garment.name} />
            <Detail label="Size" value={size} />
            <Detail label="Material" value={matName} />
            <Detail label="Color">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full border border-border/50" style={{ backgroundColor: color }} />
                <span className="text-sm">{color}</span>
              </div>
            </Detail>
          </div>
          <div className="border-t border-border/30 pt-4">
            <PriceDisplay breakdown={price} />
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <button onClick={handleDownload} className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm">Download PNG</button>
            <button onClick={handleSave} className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors text-sm">Save Design</button>
            <button onClick={handleOrder} className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity text-sm">Order Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Detail({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      {value ? <p className="text-sm font-medium mt-0.5">{value}</p> : <div className="mt-0.5">{children}</div>}
    </div>
  );
}

export default DesignSummary;
