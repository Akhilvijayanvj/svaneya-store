"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Phone, MessageCircle, Truck, Copy, ExternalLink, Check } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Dispatch modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchTrackingId, setDispatchTrackingId] = useState('');
  const [orderToDispatch, setOrderToDispatch] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  async function updateOrderStatus(orderId: string, newStatus: string) {
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId) || selectedOrder;
      setOrderToDispatch(order);
      setDispatchTrackingId(order?.tracking_id || '');
      setDispatchModalOpen(true);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      if (newStatus === 'cancelled') {
        const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', orderId);
        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
            if (product) {
              const newStock = (product.stock || 0) + item.quantity;
              await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
            }
          }
        }
      }
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  }

  async function handleConfirmDispatch() {
    if (!dispatchTrackingId.trim()) {
      alert("Please enter the India Post tracking/consignment number.");
      return;
    }

    const trackId = dispatchTrackingId.trim().toUpperCase();
    const orderId = orderToDispatch.id;

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        tracking_id: trackId,
        courier_name: 'India Post',
        shipped_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      alert("Failed to update dispatch status: " + error.message);
      return;
    }

    // Trigger push notification to customer
    if (orderToDispatch.customer_email) {
      fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'specific_user',
          target_email: orderToDispatch.customer_email,
          title: '📦 Order Dispatched!',
          body: `Your order #${orderId.slice(0, 8).toUpperCase()} has been dispatched via India Post. Tracking ID: ${trackId}`
        })
      }).catch(console.error);
    }

    const updated = {
      ...orderToDispatch,
      status: 'shipped',
      tracking_id: trackId,
      courier_name: 'India Post',
      shipped_at: new Date().toISOString()
    };

    setOrders(orders.map(o => o.id === orderId ? updated : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updated);
    }
    setDispatchModalOpen(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          products (
            name,
            images
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const copyTracking = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and process customer orders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders yet.</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">
                      {order.id.split('-')[0]}...
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {order.tracking_id ? (
                        <span className="text-blue-600 font-semibold">{order.tracking_id}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">₹{order.total_amount}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger 
                          className={buttonVariants({ variant: "ghost", size: "sm" })} 
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6 mt-4">
                              <div className="flex justify-between items-start border-b pb-4">
                                <div>
                                  <h3 className="font-semibold text-lg">Order #{selectedOrder.id.split('-')[0]}</h3>
                                  <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                  <p className="text-sm text-muted-foreground mt-1">Payment ID: {selectedOrder.payment_id}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge className={getStatusColor(selectedOrder.status)} variant="outline">
                                    {selectedOrder.status.toUpperCase()}
                                  </Badge>
                                  <Select 
                                    value={selectedOrder.status} 
                                    onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                                  >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="paid">Paid</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* India Post Tracking Card if Shipped */}
                              {selectedOrder.tracking_id && (
                                <div className="bg-slate-900 text-white rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-[#BFFF07] flex items-center justify-center text-slate-950">
                                      <Truck className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400 font-medium">Shipped via {selectedOrder.courier_name || 'India Post'}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono font-bold text-[#BFFF07] text-lg tracking-wider">
                                          {selectedOrder.tracking_id}
                                        </span>
                                        <button 
                                          onClick={() => copyTracking(selectedOrder.tracking_id)} 
                                          className="text-slate-400 hover:text-white transition-colors"
                                          title="Copy Tracking ID"
                                        >
                                          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <a
                                      href={`https://shipway.in/indiapost/${selectedOrder.tracking_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center text-xs font-semibold px-3 py-2 bg-[#BFFF07] text-slate-950 rounded-md hover:bg-[#a6de06] transition-colors"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Track with India Post
                                    </a>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs text-white border-slate-700 bg-transparent hover:bg-slate-800"
                                      onClick={() => {
                                        setOrderToDispatch(selectedOrder);
                                        setDispatchTrackingId(selectedOrder.tracking_id);
                                        setDispatchModalOpen(true);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                                {/* Customer Info Box */}
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-base">
                                      {selectedOrder.customer_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-slate-900 leading-tight truncate">{selectedOrder.customer_name}</h4>
                                      <p className="text-sm text-slate-500 truncate">{selectedOrder.customer_email}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-slate-700">{selectedOrder.customer_phone}</span>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-2">
                                    <a 
                                      href={`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g, '').length === 10 ? '91' : ''}${selectedOrder.customer_phone.replace(/\D/g, '')}?text=Hi ${encodeURIComponent(selectedOrder.customer_name.split(' ')[0])}, this is regarding your recent order #${selectedOrder.id.split('-')[0]} from Svaneya.`} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-[#25D366] text-white hover:bg-[#20b858] transition-colors"
                                    >
                                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                                    </a>
                                    <a 
                                      href={`tel:${selectedOrder.customer_phone}`} 
                                      className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                                    >
                                      <Phone className="h-4 w-4 mr-2" /> Call
                                    </a>
                                  </div>
                                </div>

                                {/* Shipping Address Box */}
                                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                  <h4 className="font-semibold mb-3 pb-3 border-b border-slate-200 text-slate-900">
                                    Shipping Address
                                  </h4>
                                  <div className="text-sm text-slate-600 space-y-1.5">
                                    <p>{selectedOrder.shipping_address?.address}</p>
                                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                                    <p className="font-medium text-slate-900 pt-1">PIN: {selectedOrder.shipping_address?.pincode || selectedOrder.shipping_address?.pin}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-4 text-sm text-muted-foreground">Order Items</h4>
                                <div className="space-y-4">
                                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center border p-3 rounded-lg">
                                      <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded overflow-hidden">
                                          {item.products?.images && item.products.images.length > 0 && (
                                            <img src={item.products.images[0]} className="h-full w-full object-cover" alt="Product" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium">{item.products?.name || 'Product'}</p>
                                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                      </div>
                                      <p className="font-bold">₹{item.quantity * item.price}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between items-center border-t pt-4">
                                <span className="font-semibold text-lg">Total Amount Paid:</span>
                                <span className="font-bold text-2xl text-primary">₹{selectedOrder.total_amount}</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* India Post Dispatch Dialog */}
      <Dialog open={dispatchModalOpen} onOpenChange={setDispatchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-600" /> Dispatch via India Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the India Post Consignment Number (Speed Post / Parcel). A notification will be dispatched to the customer with live tracking.
            </p>
            <div className="space-y-2">
              <Label htmlFor="tracking_id">Consignment / Tracking Number</Label>
              <Input
                id="tracking_id"
                placeholder="e.g. EK123456789IN"
                value={dispatchTrackingId}
                onChange={(e) => setDispatchTrackingId(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatchModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDispatch} className="bg-slate-900 text-[#BFFF07] hover:bg-slate-800">
              Confirm & Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
