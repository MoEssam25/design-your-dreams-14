import type { PriceBreakdown } from '@/lib/pricing';

interface PriceDisplayProps {
  breakdown: PriceBreakdown;
}

const PriceDisplay = ({ breakdown }: PriceDisplayProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
        Price Breakdown
      </h3>
      <div className="space-y-1.5 text-sm">
        <Row label="Base price" value={breakdown.base} />
        {breakdown.sizeExtra > 0 && <Row label="Size (XL/XXL)" value={breakdown.sizeExtra} />}
        {breakdown.materialExtra > 0 && <Row label="Material upgrade" value={breakdown.materialExtra} />}
        {breakdown.imageExtra > 0 && <Row label="Extra images" value={breakdown.imageExtra} />}
        {breakdown.backPrintExtra > 0 && <Row label="Back print" value={breakdown.backPrintExtra} />}
        {breakdown.textExtra > 0 && <Row label="Extra text" value={breakdown.textExtra} />}
      </div>
      <div className="border-t border-border/50 pt-2 mt-2 flex justify-between items-center">
        <span className="font-display font-bold text-base">Total</span>
        <span className="font-display font-bold text-lg text-primary">${breakdown.total}</span>
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">+${value}</span>
    </div>
  );
}

export default PriceDisplay;
