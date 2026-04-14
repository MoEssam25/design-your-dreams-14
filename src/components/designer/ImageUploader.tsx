import { useRef } from 'react';
import type { PlacementZone } from '@/lib/garments';
import type { PlacedImage } from '@/lib/pricing';

interface ImageUploaderProps {
  zones: PlacementZone[];
  images: PlacedImage[];
  onAdd: (zone: PlacementZone, dataUrl: string) => void;
  onRemove: (zone: PlacementZone) => void;
}

const ZONE_LABELS: Record<PlacementZone, string> = {
  'chest': '👕 Chest (Front)',
  'back': '🔙 Back',
  'left-sleeve': '💪 Left Sleeve',
  'right-sleeve': '💪 Right Sleeve',
};

const ImageUploader = ({ zones, images, onAdd, onRemove }: ImageUploaderProps) => {
  return (
    <div className="space-y-3">
      {zones.map((zone) => (
        <ZoneUpload
          key={zone}
          zone={zone}
          image={images.find(i => i.zone === zone)}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

function ZoneUpload({ zone, image, onAdd, onRemove }: {
  zone: PlacementZone;
  image?: PlacedImage;
  onAdd: (zone: PlacementZone, dataUrl: string) => void;
  onRemove: (zone: PlacementZone) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|svg)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Compress/resize
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          const ratio = Math.min(maxSize / w, maxSize / h);
          w *= ratio;
          h *= ratio;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        onAdd(zone, canvas.toDataURL('image/png', 0.8));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-colors"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <p className="text-xs font-medium text-foreground mb-2">{ZONE_LABELS[zone]}</p>
      {image ? (
        <div className="flex items-center gap-2">
          <img src={image.dataUrl} alt={zone} className="w-10 h-10 object-cover rounded" />
          <span className="text-xs text-muted-foreground flex-1">Uploaded</span>
          <button
            onClick={() => onRemove(zone)}
            className="text-xs text-destructive hover:underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          Click or drop image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default ImageUploader;
