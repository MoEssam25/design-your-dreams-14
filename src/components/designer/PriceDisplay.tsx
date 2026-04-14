import type { PriceBreakdown } from '@/lib/pricing';

interface PriceDisplayProps {
  breakdown: PriceBreakdown;
}

const PriceDisplay = ({ breakdown }: PriceDisplayProps) => {
  return (
    <div>
      <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
        Price Breakdown
      </h3>
      <div className="space-y-2 text-sm">
        <Row label="Base price" value={breakdown.base} />
        {breakdown.sizeExtra > 0 && <Row label="Size extra" value={breakdown.sizeExtra} />}
        {breakdown.materialExtra > 0 && <Row label="Material extra" value={breakdown.materialExtra} />}
        {breakdown.imageExtra > 0 && <Row label="Image extras" value={breakdown.imageExtra} />}
        {breakdown.backPrintExtra > 0 && <Row label="Back print" value={breakdown.backPrintExtra} />}
        <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-primary text-lg">${breakdown.total}</span>
        </div>
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>${value}</span>
    </div>
  );
}

export default PriceDisplay;
