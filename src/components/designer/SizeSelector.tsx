import { SIZES, type Size } from '@/lib/garments';

interface SizeSelectorProps {
  selected: Size;
  onChange: (size: Size) => void;
}

const SizeSelector = ({ selected, onChange }: SizeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            selected === size
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {size}
          {(size === 'XL' || size === 'XXL') && (
            <span className="text-xs ml-1 opacity-70">+$3</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
