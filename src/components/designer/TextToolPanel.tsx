import { useState } from 'react';
import { FONTS, DEFAULT_TEXT_STYLE, type TextStyle } from '@/lib/designState';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline, Plus } from 'lucide-react';

interface TextToolPanelProps {
  onAddText: (text: string, style: TextStyle) => void;
  onUpdateStyle: (style: Partial<TextStyle>) => void;
  selectedType: 'text' | 'image' | null;
}

const TextToolPanel = ({ onAddText, onUpdateStyle, selectedType }: TextToolPanelProps) => {
  const [text, setText] = useState('Your Text');
  const [style, setStyle] = useState<TextStyle>({ ...DEFAULT_TEXT_STYLE });

  const updateStyle = (partial: Partial<TextStyle>) => {
    const updated = { ...style, ...partial };
    setStyle(updated);
    if (selectedType === 'text') {
      onUpdateStyle(partial);
    }
  };

  const handleAdd = () => {
    onAddText(text, style);
  };

  return (
    <div className="space-y-4">
      {/* Add text */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text..."
          className="text-sm min-h-[60px] bg-secondary/50"
          rows={2}
        />
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Text
        </button>
      </div>

      {/* Font & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Font</label>
          <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs bg-secondary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(f => (
                <SelectItem key={f.name} value={f.family} className="text-xs">
                  <span style={{ fontFamily: f.family }}>{f.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Size</label>
          <Input
            type="number"
            value={style.fontSize}
            onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
            className="h-8 text-xs bg-secondary/50"
            min={8}
            max={120}
          />
        </div>
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Color</label>
        <input
          type="color"
          value={style.fill}
          onChange={(e) => updateStyle({ fill: e.target.value })}
          className="w-7 h-7 rounded cursor-pointer border border-border/50"
        />
      </div>

      {/* Bold / Italic / Underline */}
      <div className="flex gap-1">
        {[
          { icon: Bold, key: 'fontWeight' as const, active: style.fontWeight === 'bold', val: style.fontWeight === 'bold' ? 'normal' : 'bold' },
          { icon: Italic, key: 'fontStyle' as const, active: style.fontStyle === 'italic', val: style.fontStyle === 'italic' ? 'normal' : 'italic' },
          { icon: Underline, key: 'underline' as const, active: style.underline, val: !style.underline },
        ].map(({ icon: Icon, key, active, val }) => (
          <button
            key={key}
            onClick={() => updateStyle({ [key]: val } as any)}
            className={`p-2 rounded-md text-sm transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Letter Spacing */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Letter Spacing: {style.letterSpacing}</label>
        <Slider
          value={[style.letterSpacing]}
          min={-5}
          max={30}
          step={1}
          onValueChange={([v]) => updateStyle({ letterSpacing: v })}
        />
      </div>

      {/* Line Height */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Line Height: {style.lineHeight.toFixed(1)}</label>
        <Slider
          value={[style.lineHeight]}
          min={0.5}
          max={3}
          step={0.1}
          onValueChange={([v]) => updateStyle({ lineHeight: v })}
        />
      </div>

      {/* Shadow */}
      <div className="space-y-2 border border-border/30 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Drop Shadow</span>
          <Switch
            checked={style.shadow.enabled}
            onCheckedChange={(v) => updateStyle({ shadow: { ...style.shadow, enabled: v } })}
          />
        </div>
        {style.shadow.enabled && (
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Color</label>
              <input type="color" value={style.shadow.color} onChange={(e) => updateStyle({ shadow: { ...style.shadow, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border border-border/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Blur: {style.shadow.blur}</label>
              <Slider value={[style.shadow.blur]} min={0} max={20} step={1} onValueChange={([v]) => updateStyle({ shadow: { ...style.shadow, blur: v } })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">X: {style.shadow.offsetX}</label>
                <Slider value={[style.shadow.offsetX]} min={-10} max={10} step={1} onValueChange={([v]) => updateStyle({ shadow: { ...style.shadow, offsetX: v } })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y: {style.shadow.offsetY}</label>
                <Slider value={[style.shadow.offsetY]} min={-10} max={10} step={1} onValueChange={([v]) => updateStyle({ shadow: { ...style.shadow, offsetY: v } })} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stroke */}
      <div className="space-y-2 border border-border/30 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">Stroke / Outline</span>
          <Switch
            checked={style.stroke.enabled}
            onCheckedChange={(v) => updateStyle({ stroke: { ...style.stroke, enabled: v } })}
          />
        </div>
        {style.stroke.enabled && (
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Color</label>
              <input type="color" value={style.stroke.color} onChange={(e) => updateStyle({ stroke: { ...style.stroke, color: e.target.value } })} className="w-6 h-6 rounded cursor-pointer border border-border/50" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Width: {style.stroke.width}</label>
              <Slider value={[style.stroke.width]} min={0.5} max={5} step={0.5} onValueChange={([v]) => updateStyle({ stroke: { ...style.stroke, width: v } })} />
            </div>
          </div>
        )}
      </div>

      {/* Text Background */}
      <div className="space-y-2 border border-border/30 rounded-lg p-2">
        <span className="text-xs font-medium">Text Background</span>
        <div className="flex items-center gap-2">
          <input type="color" value={style.backgroundColor || '#000000'} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer border border-border/50" />
          <div className="flex-1">
            <Slider value={[style.backgroundOpacity]} min={0} max={1} step={0.1} onValueChange={([v]) => updateStyle({ backgroundOpacity: v })} />
          </div>
          <span className="text-xs text-muted-foreground w-8">{Math.round(style.backgroundOpacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default TextToolPanel;
