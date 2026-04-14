import { MATERIALS, type Material } from '@/lib/garments';

interface MaterialSelectorProps {
  selected: Material;
  onChange: (material: Material) => void;
}

const MaterialSelector = ({ selected, onChange }: MaterialSelectorProps) => {
  return (
    <div className="space-y-1.5">
      {MATERIALS.map((mat) => (
        <button
          key={mat.id}
          onClick={() => onChange(mat.id)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
            selected === mat.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <span>
            {mat.name}
            <span className="text-xs opacity-60 ml-1.5">{mat.nameAr}</span>
          </span>
          {mat.priceExtra > 0 && (
            <span className="text-xs opacity-70">+${mat.priceExtra}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MaterialSelector;
