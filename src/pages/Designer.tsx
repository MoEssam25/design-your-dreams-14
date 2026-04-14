import { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GARMENTS, SIZES, MATERIALS, type Size, type Material, type PlacementZone } from '@/lib/garments';
import { calculatePrice, type PlacedImage } from '@/lib/pricing';
import GarmentCanvas from '@/components/designer/GarmentCanvas';
import ColorPicker from '@/components/designer/ColorPicker';
import SizeSelector from '@/components/designer/SizeSelector';
import MaterialSelector from '@/components/designer/MaterialSelector';
import ImageUploader from '@/components/designer/ImageUploader';
import PriceDisplay from '@/components/designer/PriceDisplay';
import DesignSummary from '@/components/designer/DesignSummary';

const Designer = () => {
  const { garmentId } = useParams<{ garmentId: string }>();
  const navigate = useNavigate();
  const garment = GARMENTS.find(g => g.id === garmentId);

  const [color, setColor] = useState(garment?.colors[0] ?? '#ffffff');
  const [size, setSize] = useState<Size>('M');
  const [material, setMaterial] = useState<Material>('cotton');
  const [images, setImages] = useState<PlacedImage[]>([]);
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [showSummary, setShowSummary] = useState(false);

  const price = useMemo(() => {
    if (!garment) return null;
    return calculatePrice(garment, size, material, images);
  }, [garment, size, material, images]);

  const handleImageAdd = useCallback((zone: PlacementZone, dataUrl: string) => {
    setImages(prev => [...prev.filter(i => i.zone !== zone), { zone, dataUrl }]);
  }, []);

  const handleImageRemove = useCallback((zone: PlacementZone) => {
    setImages(prev => prev.filter(i => i.zone !== zone));
  }, []);

  if (!garment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Garment not found</p>
          <button onClick={() => navigate('/')} className="text-primary underline">Go back</button>
        </div>
      </div>
    );
  }

  if (showSummary && price) {
    return (
      <DesignSummary
        garment={garment}
        color={color}
        size={size}
        material={material}
        images={images}
        price={price}
        onBack={() => setShowSummary(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            ← Back
          </button>
          <h1 className="font-display font-bold gradient-text">STITCH STUDIO</h1>
          <button
            onClick={() => setShowSummary(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            View Final Design
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Color</h3>
              <ColorPicker colors={garment.colors} selected={color} onChange={setColor} />
            </div>

            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Size</h3>
              <SizeSelector selected={size} onChange={setSize} />
            </div>

            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Material</h3>
              <MaterialSelector selected={material} onChange={setMaterial} />
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="glass-card p-4">
              {/* View Toggle */}
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setActiveView('front')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'front'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Front
                </button>
                <button
                  onClick={() => setActiveView('back')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === 'back'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Back
                </button>
              </div>

              <GarmentCanvas
                garment={garment}
                color={color}
                view={activeView}
                images={images}
              />
            </div>
          </div>

          {/* Right Panel - Images & Price */}
          <div className="lg:col-span-3 space-y-4 order-3">
            <div className="glass-card p-4">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                Image Placement
              </h3>
              <ImageUploader
                zones={garment.zones}
                images={images}
                onAdd={handleImageAdd}
                onRemove={handleImageRemove}
              />
            </div>

            {price && (
              <div className="glass-card p-4 glow-border">
                <PriceDisplay breakdown={price} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Designer;
