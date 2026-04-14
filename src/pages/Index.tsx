import { useNavigate } from 'react-router-dom';
import { GARMENTS, type GarmentType } from '@/lib/garments';

const ProductSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (id: GarmentType) => {
    navigate(`/design/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold gradient-text">STITCH STUDIO</h1>
          <p className="text-sm text-muted-foreground hidden sm:block">Design Your Style</p>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
          Create Your <span className="gradient-text">Custom</span> Garment
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Choose a garment to start designing. Add colors, materials, and custom images to make it uniquely yours.
        </p>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {GARMENTS.map((garment) => (
            <button
              key={garment.id}
              onClick={() => handleSelect(garment.id)}
              className="group glass-card p-6 flex flex-col items-center gap-4 hover:glow-border transition-all duration-300 cursor-pointer"
            >
              <div className="text-7xl group-hover:animate-float transition-transform">
                {garment.icon}
              </div>
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg text-foreground">{garment.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{garment.nameAr}</p>
                <p className="text-primary font-semibold mt-2">From ${garment.basePrice}</p>
              </div>
              <div className="flex gap-1 mt-2">
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

      {/* Features */}
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
