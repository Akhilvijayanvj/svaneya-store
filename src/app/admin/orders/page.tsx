"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Phone, MessageCircle } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  async function updateOrderStatus(orderId: string, newStatus: string) {
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
      
    if (data) setOrders(data);
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'shipped': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'delivered': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage your store's orders and fulfillments.</p>
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
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders yet.</TableCell>
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
                                    <p>{selectedOrder.shipping_address.address}</p>
                                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                                    <p className="font-medium text-slate-900 pt-1">PIN: {selectedOrder.shipping_address.pincode}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-4 text-sm text-muted-foreground">Order Items</h4>
                                <div className="space-y-4">
                                  {selectedOrder.order_items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center border p-3 rounded-lg">
                                      <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-slate-100 rounded overflow-hidden">
                                          {item.products.images && item.products.images.length > 0 && (
                                            <img src={item.products.images[0]} className="h-full w-full object-cover" alt="Product" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-medium">{item.products.name}</p>
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
    </div>
  );
}
