import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import type { GarmentConfig, GarmentType, PlacementZone } from '@/lib/garments';
import type { TextStyle } from '@/lib/designState';
import { UndoRedoManager } from '@/lib/designState';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

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

const GARMENT_IMAGES: Record<GarmentType, { front: string; back: string }> = {
  tshirt: { front: tshirtFront, back: tshirtBack },
  hoodie: { front: hoodieFront, back: hoodieBack },
  jeans: { front: jeansFront, back: jeansBack },
  jacket: { front: jacketFront, back: jacketBack },
  cap: { front: capFront, back: capBack },
};

type ZoneMap = Partial<Record<PlacementZone, [number, number, number, number]>>;

const ZONE_MAPS: Record<GarmentType, { front: ZoneMap; back: ZoneMap }> = {
  tshirt: {
    front: { 'chest': [0.3, 0.3, 0.4, 0.25], 'left-sleeve': [0.08, 0.22, 0.17, 0.15], 'right-sleeve': [0.75, 0.22, 0.17, 0.15] },
    back: { 'back': [0.25, 0.22, 0.5, 0.35], 'left-sleeve': [0.75, 0.22, 0.17, 0.15], 'right-sleeve': [0.08, 0.22, 0.17, 0.15] },
  },
  hoodie: {
    front: { 'chest': [0.3, 0.32, 0.4, 0.22], 'left-sleeve': [0.06, 0.3, 0.18, 0.18], 'right-sleeve': [0.76, 0.3, 0.18, 0.18] },
    back: { 'back': [0.22, 0.25, 0.56, 0.35], 'left-sleeve': [0.76, 0.3, 0.18, 0.18], 'right-sleeve': [0.06, 0.3, 0.18, 0.18] },
  },
  jeans: {
    front: { 'chest': [0.3, 0.15, 0.4, 0.18] },
    back: { 'back': [0.3, 0.15, 0.4, 0.18] },
  },
  jacket: {
    front: { 'chest': [0.28, 0.25, 0.44, 0.28], 'left-sleeve': [0.05, 0.25, 0.18, 0.18], 'right-sleeve': [0.77, 0.25, 0.18, 0.18] },
    back: { 'back': [0.2, 0.2, 0.6, 0.38], 'left-sleeve': [0.77, 0.25, 0.18, 0.18], 'right-sleeve': [0.05, 0.25, 0.18, 0.18] },
  },
  cap: {
    front: { 'chest': [0.25, 0.15, 0.5, 0.35] },
    back: {},
  },
};

export interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  label: string;
}

export interface FabricCanvasHandle {
  addImage: (dataUrl: string, zone?: PlacementZone) => void;
  addText: (text: string, style: TextStyle) => void;
  updateTextStyle: (style: Partial<TextStyle>) => void;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getElements: () => CanvasElement[];
  selectElement: (id: string) => void;
  exportPNG: () => string | null;
  getDesignJSON: () => string;
  loadDesignJSON: (json: string) => void;
  getImageCount: () => number;
  getTextCount: () => number;
  hasBackPrint: () => boolean;
}

interface FabricCanvasProps {
  garment: GarmentConfig;
  color: string;
  view: 'front' | 'back';
  onSelectionChange?: (selected: CanvasElement | null) => void;
  onElementsChange?: () => void;
}

const CANVAS_W = 512;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  ({ garment, color, view, onSelectionChange, onElementsChange }, ref) => {
    const canvasElRef = useRef<HTMLCanvasElement>(null);
    const fcRef = useRef<fabric.Canvas | null>(null);
    const undoMgr = useRef(new UndoRedoManager());
    const [, forceRender] = useState(0);
    const isLoadingRef = useRef(false);
    const isPanningRef = useRef(false);
    const lastPanPosRef = useRef<{ x: number; y: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const canvasH = garment.id === 'cap' ? 512 : 640;
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize fabric canvas
    useEffect(() => {
      if (!canvasElRef.current) return;
      const fc = new fabric.Canvas(canvasElRef.current, {
        width: CANVAS_W,
        height: canvasH,
        selection: true,
        preserveObjectStacking: true,
      });
      fcRef.current = fc;

      fc.on('selection:created', () => notifySelection(fc));
      fc.on('selection:updated', () => notifySelection(fc));
      fc.on('selection:cleared', () => onSelectionChange?.(null));
      fc.on('object:modified', () => saveState(fc));
      fc.on('object:added', () => {
        if (!isLoadingRef.current) saveState(fc);
      });
      fc.on('object:removed', () => {
        if (!isLoadingRef.current) saveState(fc);
      });

      // Mouse wheel zoom
      fc.on('mouse:wheel', (opt) => {
        const e = opt.e as WheelEvent;
        e.preventDefault();
        e.stopPropagation();
        const delta = -e.deltaY / 300;
        let newZoom = fc.getZoom() + delta;
        newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
        fc.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), newZoom);
        setZoomLevel(newZoom);
      });

      // Pan: mouse down on empty area
      fc.on('mouse:down', (opt) => {
        const e = opt.e as MouseEvent;
        // Only pan if Alt key held or no object under cursor
        if (e.altKey || !fc.findTarget(opt.e as any)) {
          isPanningRef.current = true;
          lastPanPosRef.current = { x: e.clientX, y: e.clientY };
          fc.selection = false;
          fc.setCursor('grabbing');
          fc.renderAll();
        }
      });

      fc.on('mouse:move', (opt) => {
        if (!isPanningRef.current || !lastPanPosRef.current) return;
        const e = opt.e as MouseEvent;
        const dx = e.clientX - lastPanPosRef.current.x;
        const dy = e.clientY - lastPanPosRef.current.y;
        fc.relativePan(new fabric.Point(dx, dy));
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        fc.setCursor('grabbing');
      });

      fc.on('mouse:up', () => {
        if (isPanningRef.current) {
          isPanningRef.current = false;
          lastPanPosRef.current = null;
          fc.selection = true;
          fc.setCursor('default');
        }
      });

      // Cursor hints
      fc.on('mouse:over', (opt) => {
        if (opt.target) {
          fc.setCursor('move');
        }
      });

      return () => { fc.dispose(); fcRef.current = null; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasH]);

    // Keyboard panning
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const fc = fcRef.current;
        if (!fc) return;
        const PAN_STEP = 20;
        switch (e.key) {
          case 'ArrowLeft': fc.relativePan(new fabric.Point(PAN_STEP, 0)); e.preventDefault(); break;
          case 'ArrowRight': fc.relativePan(new fabric.Point(-PAN_STEP, 0)); e.preventDefault(); break;
          case 'ArrowUp': fc.relativePan(new fabric.Point(0, PAN_STEP)); e.preventDefault(); break;
          case 'ArrowDown': fc.relativePan(new fabric.Point(0, -PAN_STEP)); e.preventDefault(); break;
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const notifySelection = useCallback((fc: fabric.Canvas) => {
      const obj = fc.getActiveObject();
      if (!obj) { onSelectionChange?.(null); return; }
      onSelectionChange?.({
        id: (obj as any)._designId ?? '',
        type: obj.type === 'textbox' ? 'text' : 'image',
        label: obj.type === 'textbox' ? (obj as fabric.Textbox).text?.slice(0, 20) ?? 'Text' : 'Image',
      });
    }, [onSelectionChange]);

    const saveState = useCallback((fc: fabric.Canvas) => {
      undoMgr.current.save(JSON.stringify(fc.toJSON(['_designId', '_designType'])));
      onElementsChange?.();
      forceRender(n => n + 1);
    }, [onElementsChange]);

    // Zoom helpers
    const handleZoomIn = () => {
      const fc = fcRef.current;
      if (!fc) return;
      const newZoom = Math.min(MAX_ZOOM, fc.getZoom() + ZOOM_STEP);
      fc.zoomToPoint(new fabric.Point(CANVAS_W / 2, canvasH / 2), newZoom);
      setZoomLevel(newZoom);
    };

    const handleZoomOut = () => {
      const fc = fcRef.current;
      if (!fc) return;
      const newZoom = Math.max(MIN_ZOOM, fc.getZoom() - ZOOM_STEP);
      fc.zoomToPoint(new fabric.Point(CANVAS_W / 2, canvasH / 2), newZoom);
      setZoomLevel(newZoom);
    };

    const handleResetView = () => {
      const fc = fcRef.current;
      if (!fc) return;
      fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoomLevel(1);
      fc.renderAll();
    };

    // Update background when garment/color/view changes
    useEffect(() => {
      const fc = fcRef.current;
      if (!fc) return;
      const imgSrc = GARMENT_IMAGES[garment.id]?.[view];
      if (!imgSrc) return;

      const offscreen = document.createElement('canvas');
      offscreen.width = CANVAS_W;
      offscreen.height = canvasH;
      const octx = offscreen.getContext('2d')!;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        octx.clearRect(0, 0, CANVAS_W, canvasH);
        octx.drawImage(img, 0, 0, CANVAS_W, canvasH);
        if (color !== '#ffffff') {
          octx.save();
          octx.globalCompositeOperation = 'multiply';
          octx.fillStyle = color;
          octx.fillRect(0, 0, CANVAS_W, canvasH);
          octx.restore();
          octx.save();
          octx.globalCompositeOperation = 'destination-in';
          octx.drawImage(img, 0, 0, CANVAS_W, canvasH);
          octx.restore();
        }

        const zones = ZONE_MAPS[garment.id]?.[view] ?? {};
        Object.entries(zones).forEach(([zone, pos]) => {
          if (!pos) return;
          const [rx, ry, rw, rh] = pos;
          octx.save();
          octx.setLineDash([6, 4]);
          octx.strokeStyle = 'rgba(255, 180, 50, 0.5)';
          octx.lineWidth = 1.5;
          octx.strokeRect(rx * CANVAS_W, ry * canvasH, rw * CANVAS_W, rh * canvasH);
          octx.fillStyle = 'rgba(255, 180, 50, 0.6)';
          octx.font = 'bold 10px Inter, sans-serif';
          octx.textAlign = 'center';
          octx.textBaseline = 'middle';
          const label = zone === 'chest' ? 'CHEST' : zone === 'back' ? 'BACK' : zone === 'left-sleeve' ? 'L.SLEEVE' : 'R.SLEEVE';
          octx.fillText(label, (rx + rw / 2) * CANVAS_W, (ry + rh / 2) * canvasH);
          octx.restore();
        });

        const dataUrl = offscreen.toDataURL();
        fc.setBackgroundImage(dataUrl, () => fc.renderAll(), {
          originX: 'left', originY: 'top',
          scaleX: 1, scaleY: 1,
        });
      };
      img.src = imgSrc;
    }, [garment.id, color, view, canvasH]);

    useImperativeHandle(ref, () => ({
      addImage(dataUrl: string, zone?: PlacementZone) {
        const fc = fcRef.current;
        if (!fc) return;
        fabric.Image.fromURL(dataUrl, (img) => {
          const zones = ZONE_MAPS[garment.id]?.[view] ?? {};
          const zoneKey = zone ?? 'chest';
          const pos = zones[zoneKey];
          const maxW = pos ? pos[2] * CANVAS_W : 150;
          const maxH = pos ? pos[3] * canvasH : 150;
          const scale = Math.min(maxW / (img.width || 150), maxH / (img.height || 150));
          img.set({
            left: pos ? pos[0] * CANVAS_W + (pos[2] * CANVAS_W) / 2 : CANVAS_W / 2,
            top: pos ? pos[1] * canvasH + (pos[3] * canvasH) / 2 : canvasH / 2,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
            cornerStyle: 'circle',
            cornerColor: 'hsl(var(--primary))',
            transparentCorners: false,
            borderColor: 'hsl(var(--primary))',
          });
          (img as any)._designId = `img_${Date.now()}`;
          (img as any)._designType = 'image';
          fc.add(img);
          fc.setActiveObject(img);
          fc.renderAll();
        }, { crossOrigin: 'anonymous' });
      },

      addText(text: string, style: TextStyle) {
        const fc = fcRef.current;
        if (!fc) return;
        const tb = new fabric.Textbox(text, {
          left: CANVAS_W / 2,
          top: canvasH / 2,
          originX: 'center',
          originY: 'center',
          width: 200,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fill: style.fill,
          fontWeight: style.fontWeight,
          fontStyle: style.fontStyle,
          underline: style.underline,
          charSpacing: style.letterSpacing * 10,
          lineHeight: style.lineHeight,
          textAlign: 'center',
          cornerStyle: 'circle',
          cornerColor: 'hsl(var(--primary))',
          transparentCorners: false,
          borderColor: 'hsl(var(--primary))',
          editingBorderColor: 'hsl(var(--primary))',
        });
        if (style.shadow.enabled) {
          tb.set('shadow', new fabric.Shadow({
            color: style.shadow.color,
            blur: style.shadow.blur,
            offsetX: style.shadow.offsetX,
            offsetY: style.shadow.offsetY,
          }));
        }
        if (style.stroke.enabled) {
          tb.set({ stroke: style.stroke.color, strokeWidth: style.stroke.width });
        }
        if (style.backgroundColor && style.backgroundOpacity > 0) {
          tb.set('textBackgroundColor', style.backgroundColor);
        }
        (tb as any)._designId = `txt_${Date.now()}`;
        (tb as any)._designType = 'text';
        fc.add(tb);
        fc.setActiveObject(tb);
        fc.renderAll();
      },

      updateTextStyle(style: Partial<TextStyle>) {
        const fc = fcRef.current;
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (!obj || obj.type !== 'textbox') return;
        const tb = obj as fabric.Textbox;
        if (style.fontFamily !== undefined) tb.set('fontFamily', style.fontFamily);
        if (style.fontSize !== undefined) tb.set('fontSize', style.fontSize);
        if (style.fill !== undefined) tb.set('fill', style.fill);
        if (style.fontWeight !== undefined) tb.set('fontWeight', style.fontWeight);
        if (style.fontStyle !== undefined) tb.set('fontStyle', style.fontStyle);
        if (style.underline !== undefined) tb.set('underline', style.underline);
        if (style.letterSpacing !== undefined) tb.set('charSpacing', style.letterSpacing * 10);
        if (style.lineHeight !== undefined) tb.set('lineHeight', style.lineHeight);
        if (style.shadow !== undefined) {
          if (style.shadow.enabled) {
            tb.set('shadow', new fabric.Shadow({
              color: style.shadow.color,
              blur: style.shadow.blur,
              offsetX: style.shadow.offsetX,
              offsetY: style.shadow.offsetY,
            }));
          } else {
            tb.set('shadow', null as any);
          }
        }
        if (style.stroke !== undefined) {
          if (style.stroke.enabled) {
            tb.set({ stroke: style.stroke.color, strokeWidth: style.stroke.width });
          } else {
            tb.set({ stroke: '', strokeWidth: 0 });
          }
        }
        if (style.backgroundColor !== undefined || style.backgroundOpacity !== undefined) {
          const bg = style.backgroundColor ?? '';
          const op = style.backgroundOpacity ?? 0;
          tb.set('textBackgroundColor', op > 0 ? bg : '');
        }
        fc.renderAll();
        saveState(fc);
      },

      deleteSelected() {
        const fc = fcRef.current;
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.remove(obj); fc.discardActiveObject(); fc.renderAll(); }
      },

      bringForward() {
        const fc = fcRef.current;
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.bringForward(obj); fc.renderAll(); saveState(fc); }
      },

      sendBackward() {
        const fc = fcRef.current;
        if (!fc) return;
        const obj = fc.getActiveObject();
        if (obj) { fc.sendBackwards(obj); fc.renderAll(); saveState(fc); }
      },

      undo() {
        const fc = fcRef.current;
        if (!fc) return;
        const state = undoMgr.current.undo();
        if (state) {
          isLoadingRef.current = true;
          fc.loadFromJSON(state, () => {
            fc.renderAll();
            isLoadingRef.current = false;
            onElementsChange?.();
            forceRender(n => n + 1);
          });
        }
      },

      redo() {
        const fc = fcRef.current;
        if (!fc) return;
        const state = undoMgr.current.redo();
        if (state) {
          isLoadingRef.current = true;
          fc.loadFromJSON(state, () => {
            fc.renderAll();
            isLoadingRef.current = false;
            onElementsChange?.();
            forceRender(n => n + 1);
          });
        }
      },

      canUndo: () => undoMgr.current.canUndo(),
      canRedo: () => undoMgr.current.canRedo(),

      getElements(): CanvasElement[] {
        const fc = fcRef.current;
        if (!fc) return [];
        return fc.getObjects().map((obj, i) => ({
          id: (obj as any)._designId ?? `obj_${i}`,
          type: obj.type === 'textbox' ? 'text' as const : 'image' as const,
          label: obj.type === 'textbox'
            ? (obj as fabric.Textbox).text?.slice(0, 20) ?? 'Text'
            : `Image ${i + 1}`,
        }));
      },

      selectElement(id: string) {
        const fc = fcRef.current;
        if (!fc) return;
        const obj = fc.getObjects().find(o => (o as any)._designId === id);
        if (obj) { fc.setActiveObject(obj); fc.renderAll(); }
      },

      exportPNG(): string | null {
        const fc = fcRef.current;
        if (!fc) return null;
        // Reset viewport for clean export
        const vpt = fc.viewportTransform?.slice() as number[] | undefined;
        fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
        fc.discardActiveObject();
        fc.renderAll();
        const data = fc.toDataURL({ format: 'png', multiplier: 2 });
        if (vpt) fc.setViewportTransform(vpt as any);
        fc.renderAll();
        return data;
      },

      getDesignJSON(): string {
        const fc = fcRef.current;
        if (!fc) return '{}';
        return JSON.stringify(fc.toJSON(['_designId', '_designType']));
      },

      loadDesignJSON(json: string) {
        const fc = fcRef.current;
        if (!fc) return;
        isLoadingRef.current = true;
        fc.loadFromJSON(json, () => {
          fc.renderAll();
          isLoadingRef.current = false;
          onElementsChange?.();
        });
      },

      getImageCount(): number {
        const fc = fcRef.current;
        if (!fc) return 0;
        return fc.getObjects().filter(o => o.type === 'image').length;
      },

      getTextCount(): number {
        const fc = fcRef.current;
        if (!fc) return 0;
        return fc.getObjects().filter(o => o.type === 'textbox').length;
      },

      hasBackPrint(): boolean {
        return view === 'back' && (fcRef.current?.getObjects().length ?? 0) > 0;
      },
    }), [garment.id, view, canvasH, saveState, onSelectionChange, onElementsChange]);

    // Minimap data
    const minimapSize = 80;
    const showMinimap = zoomLevel > 1.05;

    return (
      <div className="relative" ref={wrapperRef}>
        {/* Zoom controls bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              className="p-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-muted-foreground w-14 text-center tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              className="p-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-30 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Move className="w-3 h-3" /> Alt+drag or scroll empty area to pan
            </span>
            <button
              onClick={handleResetView}
              className="px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-xs font-medium flex items-center gap-1"
              title="Reset Camera"
            >
              <Maximize className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4 overflow-hidden relative">
          <canvas
            ref={canvasElRef}
            className="max-w-full h-auto max-h-[500px]"
            style={{ border: '1px solid hsl(var(--border) / 0.3)', borderRadius: '8px' }}
          />

          {/* Minimap */}
          {showMinimap && (
            <div
              className="absolute bottom-6 right-6 border border-border/50 rounded-md bg-background/80 backdrop-blur-sm overflow-hidden shadow-lg"
              style={{ width: minimapSize, height: minimapSize * (canvasH / CANVAS_W) }}
            >
              <MiniMap
                canvasRef={fcRef}
                canvasW={CANVAS_W}
                canvasH={canvasH}
                size={minimapSize}
                zoom={zoomLevel}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Minimap component
function MiniMap({
  canvasRef,
  canvasW,
  canvasH,
  size,
  zoom,
}: {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasW: number;
  canvasH: number;
  size: number;
  zoom: number;
}) {
  const miniRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const draw = () => {
      const fc = canvasRef.current;
      const ctx = miniRef.current?.getContext('2d');
      if (!fc || !ctx) return;

      const ratio = size / canvasW;
      const h = canvasH * ratio;
      ctx.clearRect(0, 0, size, h);

      // Draw garment thumbnail
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, size, h);

      // Viewport rectangle
      const vpt = fc.viewportTransform;
      if (vpt) {
        const vpLeft = -vpt[4] / vpt[0];
        const vpTop = -vpt[5] / vpt[3];
        const vpWidth = canvasW / vpt[0];
        const vpHeight = canvasH / vpt[3];

        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          vpLeft * ratio,
          vpTop * ratio,
          vpWidth * ratio,
          vpHeight * ratio
        );
      }
    };
    draw();
    const interval = setInterval(draw, 200);
    return () => clearInterval(interval);
  }, [canvasRef, canvasW, canvasH, size, zoom]);

  return (
    <canvas
      ref={miniRef}
      width={size}
      height={size * (canvasH / canvasW)}
      className="w-full h-full"
    />
  );
}

FabricCanvas.displayName = 'FabricCanvas';
export default FabricCanvas;
