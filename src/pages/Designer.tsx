import { useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GARMENTS, SIZES, MATERIALS, type Size, type Material, type PlacementZone } from '@/lib/garments';
import { calculatePrice } from '@/lib/pricing';
import type { TextStyle } from '@/lib/designState';
import FabricCanvas, { type FabricCanvasHandle, type CanvasElement } from '@/components/designer/FabricCanvas';
import ColorPicker from '@/components/designer/ColorPicker';
import SizeSelector from '@/components/designer/SizeSelector';
import MaterialSelector from '@/components/designer/MaterialSelector';
import ImageUploader from '@/components/designer/ImageUploader';
import PriceDisplay from '@/components/designer/PriceDisplay';
import DesignSummary from '@/components/designer/DesignSummary';
import TextToolPanel from '@/components/designer/TextToolPanel';
import LayerPanel from '@/components/designer/LayerPanel';
import { Undo, Redo, Image, Type, Layers, Palette, Ruler, Shirt } from 'lucide-react';

type Panel = 'garment' | 'text' | 'layers';

const Designer = () => {
  const { garmentId } = useParams<{ garmentId: string }>();
  const navigate = useNavigate();
  const garment = GARMENTS.find(g => g.id === garmentId);
  const canvasRef = useRef<FabricCanvasHandle>(null);

  const [color, setColor] = useState(garment?.colors[0] ?? '#ffffff');
  const [size, setSize] = useState<Size>('M');
  const [material, setMaterial] = useState<Material>('cotton');
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [showSummary, setShowSummary] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>('garment');
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [, forceRender] = useState(0);

  const refreshElements = useCallback(() => {
    if (canvasRef.current) {
      setElements(canvasRef.current.getElements());
    }
    forceRender(n => n + 1);
  }, []);

  const price = useMemo(() => {
    if (!garment) return null;
    const imgCount = canvasRef.current?.getImageCount() ?? 0;
    const txtCount = canvasRef.current?.getTextCount() ?? 0;
    const hasBack = canvasRef.current?.hasBackPrint() ?? false;
    return calculatePrice(garment, size, material, imgCount, txtCount, hasBack);
  }, [garment, size, material, elements]);

  const handleImageAdd = useCallback((zone: PlacementZone, dataUrl: string) => {
    canvasRef.current?.addImage(dataUrl, zone);
  }, []);

  const handleAddText = useCallback((text: string, style: TextStyle) => {
    canvasRef.current?.addText(text, style);
  }, []);

  const handleUpdateTextStyle = useCallback((style: Partial<TextStyle>) => {
    canvasRef.current?.updateTextStyle(style);
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
        images={[]}
        price={price}
        onBack={() => setShowSummary(false)}
        canvasRef={canvasRef}
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
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <button
              onClick={() => { canvasRef.current?.undo(); refreshElements(); }}
              disabled={!canvasRef.current?.canUndo()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => { canvasRef.current?.redo(); refreshElements(); }}
              disabled={!canvasRef.current?.canRedo()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSummary(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              View Final Design
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-2 order-2 lg:order-1">
            {/* Panel tabs */}
            <div className="flex gap-1 glass-card p-1">
              {([
                { id: 'garment' as Panel, icon: Shirt, label: 'Garment' },
                { id: 'text' as Panel, icon: Type, label: 'Text' },
                { id: 'layers' as Panel, icon: Layers, label: 'Layers' },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActivePanel(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activePanel === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Garment panel */}
            {activePanel === 'garment' && (
              <div className="space-y-4">
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
            )}

            {/* Text panel */}
            {activePanel === 'text' && (
              <div className="glass-card p-4">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Add & Style Text</h3>
                <TextToolPanel
                  onAddText={handleAddText}
                  onUpdateStyle={handleUpdateTextStyle}
                  selectedType={selectedElement?.type ?? null}
                />
              </div>
            )}

            {/* Layers panel */}
            {activePanel === 'layers' && (
              <div className="glass-card p-4">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Layers</h3>
                <LayerPanel
                  elements={elements}
                  selectedId={selectedElement?.id ?? null}
                  onSelect={(id) => canvasRef.current?.selectElement(id)}
                  onBringForward={() => canvasRef.current?.bringForward()}
                  onSendBackward={() => canvasRef.current?.sendBackward()}
                  onDelete={() => { canvasRef.current?.deleteSelected(); refreshElements(); }}
                />
              </div>
            )}
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

              <FabricCanvas
                ref={canvasRef}
                garment={garment}
                color={color}
                view={activeView}
                onSelectionChange={setSelectedElement}
                onElementsChange={refreshElements}
              />

              {/* Selected element info */}
              {selectedElement && (
                <div className="mt-3 flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    Selected: <strong className="text-foreground">{selectedElement.label}</strong> ({selectedElement.type})
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => canvasRef.current?.bringForward()} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80">↑ Forward</button>
                    <button onClick={() => canvasRef.current?.sendBackward()} className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80">↓ Back</button>
                    <button onClick={() => { canvasRef.current?.deleteSelected(); refreshElements(); }} className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30">Delete</button>
                  </div>
                </div>
              )}
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
                images={[]}
                onAdd={handleImageAdd}
                onRemove={() => {}}
              />
            </div>

            {price && (
              <div className="glass-card p-4 glow-border">
                <PriceDisplay breakdown={price} />
              </div>
            )}

            {/* Save/Load design JSON */}
            <div className="glass-card p-4 space-y-2">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Save / Load</h3>
              <button
                onClick={() => {
                  const json = canvasRef.current?.getDesignJSON();
                  if (json) {
                    const designs = JSON.parse(localStorage.getItem('stitch_designs_v2') || '[]');
                    designs.push({ garmentId: garment.id, color, size, material, view: activeView, canvas: json, savedAt: new Date().toISOString() });
                    localStorage.setItem('stitch_designs_v2', JSON.stringify(designs));
                    alert('Design saved!');
                  }
                }}
                className="w-full text-sm px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                💾 Save Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Designer;
