"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelOrder, updateOrderAddress } from "./actions";

export function OrderActions({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(order.shipping_address?.address || "");
  const [city, setCity] = useState(order.shipping_address?.city || "");
  const [state, setState] = useState(order.shipping_address?.state || "");
  const [pincode, setPincode] = useState(order.shipping_address?.pincode || "");
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const canEdit = order.status === 'paid' || order.status === 'pending';
  
  if (!canEdit) return null;

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    setLoading(true);
    try {
      await cancelOrder(order.id);
    } catch (err: any) {
      alert("Failed to cancel: " + err.message);
    }
    setLoading(false);
  }

  async function handleUpdateAddress(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass the entire updated shipping object
      const newAddressLine = JSON.stringify({ address, city, state, pincode });
      // Wait, updateOrderAddress currently expects a string for the address line.
      // I should pass the full object! I will update the action too.
      await updateOrderAddress(order.id, newAddressLine);
      setIsAddressOpen(false);
    } catch (err: any) {
      alert("Failed to update address: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
      <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading} className="text-red-600 hover:text-red-700 hover:bg-red-50">
        {loading ? "Processing..." : "Cancel Order"}
      </Button>
      
      <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" disabled={loading}>Change Address</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Shipping Address</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAddress} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input required value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input required value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input required value={state} onChange={e => setState(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>PIN Code</Label>
              <Input required value={pincode} onChange={e => setPincode(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>Save New Address</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
