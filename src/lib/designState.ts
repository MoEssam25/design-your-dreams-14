export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  underline: boolean;
  letterSpacing: number;
  lineHeight: number;
  backgroundColor: string;
  backgroundOpacity: number;
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 32,
  fill: '#ffffff',
  fontWeight: 'normal',
  fontStyle: 'normal',
  underline: false,
  letterSpacing: 0,
  lineHeight: 1.2,
  backgroundColor: '',
  backgroundOpacity: 0,
  shadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 },
  stroke: { enabled: false, color: '#000000', width: 1 },
};

export const FONTS = [
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Impact', family: 'Impact, sans-serif' },
  { name: 'Times New Roman', family: '"Times New Roman", serif' },
  { name: 'Comic Sans', family: '"Comic Sans MS", cursive' },
  { name: 'Monospace', family: '"Courier New", monospace' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Verdana', family: 'Verdana, sans-serif' },
];

export interface DesignElement {
  id: string;
  type: 'image' | 'text';
  fabricId: string;
}

export type DesignAction = {
  type: 'add' | 'remove' | 'modify';
  canvasJSON: string;
};

export class UndoRedoManager {
  private history: string[] = [];
  private pointer = -1;
  private maxSize = 10;

  save(state: string) {
    // Remove future states
    this.history = this.history.slice(0, this.pointer + 1);
    this.history.push(state);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    this.pointer = this.history.length - 1;
  }

  undo(): string | null {
    if (this.pointer <= 0) return null;
    this.pointer--;
    return this.history[this.pointer];
  }

  redo(): string | null {
    if (this.pointer >= this.history.length - 1) return null;
    this.pointer++;
    return this.history[this.pointer];
  }

  canUndo() { return this.pointer > 0; }
  canRedo() { return this.pointer < this.history.length - 1; }
}
