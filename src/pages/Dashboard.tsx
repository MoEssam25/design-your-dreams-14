import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Package, Pencil, Trash2 } from 'lucide-react';

interface Design {
  id: string;
  garment_id: string;
  name: string;
  color: string;
  size: string;
  material: string;
  total_price: number | null;
  created_at: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  shipping_city: string;
  created_at: string;
  design_snapshot: any;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'designs' | 'orders'>('designs');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    // Fetch designs
    supabase.from('designs').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setDesigns(data);
    });
    // Fetch orders
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data as Order[]);
    });
  }, [user]);

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase.from('designs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      setDesigns(prev => prev.filter(d => d.id !== id));
      toast({ title: 'Design deleted' });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-display font-bold gradient-text">STITCH STUDIO</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button onClick={handleLogout} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">My Dashboard</h1>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Design
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 glass-card p-1 w-fit">
          <button onClick={() => setTab('designs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'designs' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Pencil className="w-3.5 h-3.5 inline mr-1.5" />Designs ({designs.length})
          </button>
          <button onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'orders' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Package className="w-3.5 h-3.5 inline mr-1.5" />Orders ({orders.length})
          </button>
        </div>

        {tab === 'designs' && (
          <div className="space-y-3">
            {designs.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No saved designs yet.</p>
                <Link to="/" className="text-primary hover:underline text-sm mt-2 inline-block">Start designing →</Link>
              </div>
            ) : designs.map(d => (
              <div key={d.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg border border-border/50" style={{ backgroundColor: d.color }} />
                  <div>
                    <p className="font-medium text-sm">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.garment_id} • {d.size} • {d.material}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {d.total_price && <span className="text-sm font-semibold">${d.total_price}</span>}
                  <button onClick={() => navigate(`/design/${d.garment_id}`)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteDesign(d.id)}
                    className="p-2 rounded-lg text-destructive/60 hover:text-destructive transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{o.shipping_city} • {new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    o.status === 'pending' ? 'bg-warning/20 text-warning' :
                    o.status === 'completed' ? 'bg-success/20 text-success' :
                    'bg-muted text-muted-foreground'
                  }`}>{o.status}</span>
                  <span className="text-sm font-semibold">${o.total_price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
