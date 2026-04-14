interface ColorPickerProps {
  colors: string[];
  selected: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ colors, selected, onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
            selected === color
              ? 'border-primary scale-110 shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
              : 'border-border/50'
          }`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <label className="w-8 h-8 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary transition-colors text-xs text-muted-foreground">
        +
        <input
          type="color"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  );
};

export default ColorPicker;
