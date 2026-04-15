import { Image, Type, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { CanvasElement } from './FabricCanvas';

interface LayerPanelProps {
  elements: CanvasElement[];
  onSelect: (id: string) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  selectedId: string | null;
}

const LayerPanel = ({ elements, onSelect, onBringForward, onSendBackward, onDelete, selectedId }: LayerPanelProps) => {
  return (
    <div className="space-y-2">
      {/* Controls for selected element */}
      <div className="flex gap-1 mb-2">
        <button onClick={onBringForward} className="p-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs" title="Bring Forward">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={onSendBackward} className="p-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs" title="Send Backward">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 text-xs ml-auto" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer list (reverse order - top first) */}
      {elements.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No elements yet</p>
      ) : (
        <div className="space-y-1">
          {[...elements].reverse().map((el) => (
            <button
              key={el.id}
              onClick={() => onSelect(el.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left ${
                selectedId === el.id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {el.type === 'text' ? <Type className="w-3.5 h-3.5 shrink-0" /> : <Image className="w-3.5 h-3.5 shrink-0" />}
              <span className="truncate">{el.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Background garment label */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-muted/50 text-xs text-muted-foreground border border-border/30">
        <span className="w-3.5 h-3.5 rounded bg-muted-foreground/30 shrink-0" />
        <span>Garment (Background)</span>
      </div>
    </div>
  );
};

export default LayerPanel;
