import { useNavigate } from 'react-router-dom';
import { GARMENTS, type GarmentType } from '@/lib/garments';

import tshirtFront from '@/assets/garments/tshirt-front.png';
import hoodieFront from '@/assets/garments/hoodie-front.png';
import jeansFront from '@/assets/garments/jeans-front.png';
import jacketFront from '@/assets/garments/jacket-front.png';
import capFront from '@/assets/garments/cap-front.png';

const GARMENT_THUMBS: Record<GarmentType, string> = {
  tshirt: tshirtFront,
  hoodie: hoodieFront,
  jeans: jeansFront,
  jacket: jacketFront,
  cap: capFront,
};

const ProductSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold gradient-text">STITCH STUDIO</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Design Your Style</p>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
          Create Your <span className="gradient-text">Custom</span> Garment
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose a garment to start designing. Add colors, materials, and custom images to make it uniquely yours.
        </p>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {GARMENTS.map((garment) => (
            <button
              key={garment.id}
              onClick={() => navigate(`/design/${garment.id}`)}
              className="group glass-card p-4 flex flex-col items-center gap-3 hover:glow-border transition-all duration-300 cursor-pointer"
            >
              <div className="w-full aspect-square flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden p-2">
                <img
                  src={GARMENT_THUMBS[garment.id]}
                  alt={garment.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg text-foreground">{garment.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{garment.nameAr}</p>
                <p className="text-primary font-semibold mt-1">From ${garment.basePrice}</p>
              </div>
              <div className="flex gap-1">
                {garment.colors.slice(0, 5).map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full border border-border/50"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🎨', title: 'Custom Colors', desc: 'Pick from a rich palette to match your style' },
            { icon: '📐', title: 'Image Placement', desc: 'Upload and position images on sleeves, chest, or back' },
            { icon: '💰', title: 'Transparent Pricing', desc: 'See real-time price updates as you customize' },
          ].map((f, i) => (
            <div key={i} className="glass-card p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h4 className="font-display font-semibold mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductSelection;
