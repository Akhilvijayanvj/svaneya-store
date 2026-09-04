"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Tag } from 'lucide-react';

export default function AdminPromoCodesPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_amount: '',
    min_order_amount: '0',
    is_active: true
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPromos(data);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.from('promo_codes').insert({
      code: formData.code.toUpperCase().trim(),
      discount_type: formData.discount_type,
      discount_amount: parseFloat(formData.discount_amount),
      min_order_amount: parseFloat(formData.min_order_amount),
      is_active: formData.is_active
    }).select().single();

    if (error) {
      alert("Error: " + error.message);
    } else {
      setPromos([data, ...promos]);
      setIsDialogOpen(false);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_amount: '',
        min_order_amount: '0',
        is_active: true
      });
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);
      
    if (!error) {
      setPromos(promos.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    }
  }

  async function deletePromo(id: string) {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);
      
    if (!error) {
      setPromos(promos.filter(p => p.id !== id));
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">Create and manage discount codes.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> New Code</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Code (e.g. WELCOME10)</Label>
                <Input 
                  required 
                  className="uppercase"
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select 
                    value={formData.discount_type || ""} 
                    onValueChange={(val: any) => setFormData({...formData, discount_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input 
                    required 
                    type="number" 
                    min="1"
                    value={formData.discount_amount} 
                    onChange={e => setFormData({...formData, discount_amount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Minimum Order Amount (₹) - Optional</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={formData.min_order_amount} 
                  onChange={e => setFormData({...formData, min_order_amount: e.target.value})} 
                />
              </div>

              <Button type="submit" className="w-full">Save Code</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : promos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  No promo codes created yet.
                </TableCell>
              </TableRow>
            ) : promos.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                <TableCell>
                  {promo.discount_type === 'percentage' 
                    ? `${promo.discount_amount}% OFF` 
                    : `₹${promo.discount_amount} OFF`}
                </TableCell>
                <TableCell>₹{promo.min_order_amount}</TableCell>
                <TableCell>
                  <Badge 
                    variant={promo.is_active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(promo.id, promo.is_active)}
                  >
                    {promo.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deletePromo(promo.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
