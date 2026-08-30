import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ShoppingCart, IndianRupee, Clock, ArrowRight, PlusCircle, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Fetch real data
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const safeOrders = orders || [];
  
  // Calculations
  const totalRevenue = safeOrders
    .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status.toLowerCase()))
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    
  const pendingOrders = safeOrders.filter(o => o.status.toLowerCase() === 'pending').length;
  const recentOrders = safeOrders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'shipped': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'delivered': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const { data: notifications } = await supabase
    .from('admin_notifications')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  const safeNotifications = notifications || [];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/new">
            <Button className="bg-slate-900 text-white hover:bg-slate-800">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground mt-1">From successful orders</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{safeOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime orders placed</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Orders</CardTitle>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{productCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in store</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 border-none shadow-sm h-fit">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <CardDescription>Your latest customer transactions.</CardDescription>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No orders found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6">Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right px-6">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="px-6">
                        <div className="font-medium text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-medium px-6">
                        ₹{order.total_amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {safeNotifications.length > 0 && (
            <Card className="border-none shadow-sm bg-orange-50 text-orange-900 border border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                  Customer Alerts
                </CardTitle>
                <CardDescription className="text-orange-700/80">
                  {safeNotifications.length} recent change{safeNotifications.length > 1 ? 's' : ''} require your attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {safeNotifications.slice(0, 5).map((notif: any) => (
                  <div key={notif.id} className="bg-white/60 p-3 rounded-md text-sm border border-orange-100 flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold">{notif.title}</p>
                      <p className="text-orange-800">{notif.message}</p>
                      <p className="text-xs text-orange-600/70 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                    <form action={async () => {
                      "use server";
                      const { markNotificationRead } = await import('./actions');
                      await markNotificationRead(notif.id);
                    }}>
                      <button type="submit" className="text-xs text-orange-600 hover:text-orange-800 underline">Dismiss</button>
                    </form>
                  </div>
                ))}
                <form action="/admin/orders" className="pt-2">
                   <Button variant="outline" size="sm" className="w-full bg-white hover:bg-orange-100 border-orange-200 text-orange-800">
                     Review Orders
                   </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-xl text-white">Need Help?</CardTitle>
              <CardDescription className="text-slate-300">
                Quick tips for managing your store.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-slate-100">Managing Orders</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Head to the Orders tab to view customer details and update shipping statuses to notify customers.
                </p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm text-slate-100">Store Appearance</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go to Settings to swap out the hero images on your storefront home page anytime.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
