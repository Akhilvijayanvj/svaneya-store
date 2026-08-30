import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { OrderActions } from './order-actions';

export default async function AccountPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Simple admin check
  const isAdmin = user.email === 'akhilvijayan427@gmail.com' || user.email?.includes('admin') || user.email === 'admin@svaneya.in';

  // Fetch orders matching the user's email
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        price,
        products (
          id,
          name,
          images
        )
      )
    `)
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <span className="flex items-center text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors">
                Admin Dashboard
              </span>
            </Link>
          )}
          <form action="/login" method="POST">
            <button formAction={async () => {
              "use server";
              const { logout } = await import('../login/actions');
              await logout();
            }} className="flex items-center text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors px-2">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </div>

      {!isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order History
            </CardTitle>
          </CardHeader>
          <CardContent>
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>You haven't placed any orders yet.</p>
              <Link href="/products" className="text-primary hover:underline mt-2 inline-block">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Placed</p>
                      <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium">₹{order.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-medium text-xs font-mono">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {order.status.toUpperCase()}
                      </Badge>
                      {order.status === 'shipped' && (
                        <p className="text-xs text-blue-600 flex items-center justify-end mt-1 font-medium">
                          <Truck className="h-3 w-3 mr-1" /> On the way!
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4 bg-white">
                    {order.order_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="h-16 w-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                          {item.products.images && item.products.images.length > 0 && (
                            <img src={item.products.images[0]} className="h-full w-full object-cover" alt="Product" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/product/${item.products.id || '#'}`} className="font-medium hover:text-primary transition-colors">
                            {item.products.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-medium">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                    
                    <OrderActions order={order} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-slate-50 border rounded-lg">
          <Package className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-medium text-slate-900">You are logged in as an Admin.</p>
          <p className="mt-1">Head over to the Admin Dashboard to manage the store.</p>
        </div>
      )}
    </div>
  );
}
