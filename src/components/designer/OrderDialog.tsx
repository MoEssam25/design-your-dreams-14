import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { GarmentConfig, Size, Material } from '@/lib/garments';
import type { PriceBreakdown } from '@/lib/pricing';
import type { FabricCanvasHandle } from './FabricCanvas';
import type { MutableRefObject } from 'react';

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  garment: GarmentConfig;
  color: string;
  size: Size;
  material: Material;
  price: PriceBreakdown;
  canvasRef: MutableRefObject<FabricCanvasHandle | null>;
}

const OrderDialog = ({ open, onClose, garment, color, size, material, price, canvasRef }: OrderDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', country: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="glass-card p-6 max-w-sm w-full mx-4 space-y-4">
          <h2 className="font-display font-bold text-lg">Sign in to Order</h2>
          <p className="text-sm text-muted-foreground">You need an account to place orders and save designs permanently.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm">Sign In</button>
            <button onClick={() => navigate('/signup')} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">Sign Up</button>
          </div>
          <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!shipping.name || !shipping.address || !shipping.city) {
      toast({ title: 'Please fill shipping details', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    // Save design first
    const canvasJson = canvasRef.current?.getDesignJSON() ?? '{}';
    const { data: designData } = await supabase.from('designs').insert({
      user_id: user.id,
      garment_id: garment.id,
      name: `${garment.name} Design`,
      color,
      size,
      material,
      canvas_json: canvasJson,
      total_price: price.total,
    }).select('id').single();

    // Create order
    const { error } = await supabase.from('orders').insert([{
      user_id: user.id,
      design_id: designData?.id ?? undefined,
      design_snapshot: { garment: garment.id, color, size, material, price } as unknown as import('@/integrations/supabase/types').Json,
      total_price: price.total,
      shipping_name: shipping.name,
      shipping_address: shipping.address,
      shipping_city: shipping.city,
      shipping_country: shipping.country,
      shipping_phone: shipping.phone,
    }]);

    setSubmitting(false);
    if (error) {
      toast({ title: 'Order failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Order placed!', description: `Total: $${price.total}. We will contact you soon.` });
      onClose();
      navigate('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-6 max-w-md w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display font-bold text-lg">Shipping Details</h2>
        <p className="text-sm text-muted-foreground">Total: <strong className="text-foreground">${price.total}</strong></p>

        <div className="space-y-3">
          {([
            { key: 'name', label: 'Full Name', required: true },
            { key: 'address', label: 'Address', required: true },
            { key: 'city', label: 'City', required: true },
            { key: 'country', label: 'Country', required: false },
            { key: 'phone', label: 'Phone', required: false },
          ] as const).map(({ key, label, required }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}{required && ' *'}</label>
              <input
                type="text"
                value={shipping[key]}
                onChange={e => setShipping(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary text-foreground border border-border/50 focus:border-primary focus:outline-none text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleOrder} disabled={submitting}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Placing order…' : 'Confirm Order'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDialog;
