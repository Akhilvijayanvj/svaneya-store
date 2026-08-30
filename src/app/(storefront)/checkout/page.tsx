"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { items, getTotal, clearCart } = useCartStore();
  
  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && !isSuccess) {
      router.push('/cart');
    }
    
    // Fetch past order if logged in, but don't autofill
    async function fetchSavedAddress() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Just prefill email if no past orders
      setFormData(prev => ({ ...prev, email: user.email || "" }));
      
      const { data: pastOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (pastOrder && pastOrder.shipping_address) {
        setSavedAddress(pastOrder);
      }
    }
    fetchSavedAddress();
  }, [items, router, isSuccess]);

  const handleUseSavedAddress = () => {
    if (savedAddress) {
      setFormData({
        name: savedAddress.customer_name || "",
        email: savedAddress.customer_email || formData.email,
        phone: savedAddress.customer_phone || "",
        address: savedAddress.shipping_address?.address || "",
        city: savedAddress.shipping_address?.city || "",
        state: savedAddress.shipping_address?.state || "",
        pincode: savedAddress.shipping_address?.pincode || ""
      });
    }
  };

  if (!mounted || items.length === 0) return null;

  // Calculate discount
  let discountValue = 0;
  const cartSubtotal = getTotal();
  if (appliedPromo) {
    if (appliedPromo.discount_type === 'percentage') {
      discountValue = (cartSubtotal * appliedPromo.discount_amount) / 100;
    } else {
      discountValue = appliedPromo.discount_amount;
    }
    // Prevent discount from exceeding subtotal
    if (discountValue > cartSubtotal) discountValue = cartSubtotal;
  }

  const shippingCost = cartSubtotal > 999 ? 0 : 50;
  const totalAmount = (cartSubtotal - discountValue) + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase().trim())
      .single();

    if (error || !data) {
      setPromoError("Invalid or expired promo code");
      setAppliedPromo(null);
    } else if (data.min_order_amount && cartSubtotal < data.min_order_amount) {
      setPromoError(`This code requires a minimum order of ₹${data.min_order_amount}`);
      setAppliedPromo(null);
    } else {
      setAppliedPromo(data);
      setPromoCode("");
    }
    setPromoLoading(false);
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Razorpay Order on our server
      const res = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }),
      });
      const order = await res.json();

      if (order.error) throw new Error(order.error);

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount, 
        currency: order.currency,
        name: "Svaneya",
        description: "Test Transaction",
        order_id: order.id, 
        handler: async function (response: any) {
          // 3. Payment successful, save order to Supabase
          try {
            const { data: orderData, error: orderError } = await supabase.from('orders').insert({
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              shipping_address: {
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
              },
              total_amount: totalAmount,
              status: 'paid',
              payment_id: response.razorpay_payment_id
            }).select().single();

            if (orderError) throw orderError;

            // 4. Save order items
            const orderItems = items.map(item => ({
              order_id: orderData.id,
              product_id: item.id,
              quantity: item.quantity,
              price: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 4.5 Decrease stock
            for (const item of items) {
              if (item.stock && item.quantity) {
                const newStock = Math.max(0, item.stock - item.quantity);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
              }
            }

            // 5. Clear cart and redirect
            setIsSuccess(true);
            clearCart();
            router.push(`/checkout/success?order_id=${orderData.id}&email=${encodeURIComponent(formData.email)}`);
            
          } catch (err: any) {
            console.error("Error saving order:", err);
            alert(`Error saving order: ${err.message || err.error_description || JSON.stringify(err)}`);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#0f172a"
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-6">Shipping Details</h2>
          
          {savedAddress && (
            <div className="mb-6 p-4 border rounded-lg bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Previous Address
                </h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUseSavedAddress}
                  className="text-xs h-8 bg-white"
                >
                  Use This Address
                </Button>
              </div>
              <div className="text-sm text-slate-600 pl-6 space-y-0.5">
                <p className="font-medium text-slate-900">{savedAddress.customer_name}</p>
                <p>{savedAddress.shipping_address?.address}</p>
                <p>{savedAddress.shipping_address?.city}, {savedAddress.shipping_address?.state} {savedAddress.shipping_address?.pincode}</p>
                <p className="pt-1">{savedAddress.customer_phone}</p>
              </div>
            </div>
          )}

          <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required value={formData.address} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required value={formData.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required value={formData.state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code</Label>
                <Input id="pincode" name="pincode" required value={formData.pincode} onChange={handleChange} />
              </div>
            </div>
          </form>
        </div>

        <div>
          <div className="bg-slate-50 p-6 rounded-lg border sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.quantity}x</span>
                    <span className="font-medium line-clamp-1 max-w-[200px]">{item.name}</span>
                  </div>
                  <span className="whitespace-nowrap">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Promo Code Section */}
            <div className="py-4 border-t border-b mb-6">
              {!appliedPromo ? (
                <div className="space-y-2">
                  <Label>Have a promo code?</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code" 
                      className="uppercase"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                    >
                      {promoLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                  {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold uppercase tracking-wider">{appliedPromo.code}</span>
                    <span className="text-xs">
                      {appliedPromo.discount_type === 'percentage' 
                        ? `${appliedPromo.discount_amount}% OFF` 
                        : `₹${appliedPromo.discount_amount} OFF`} applied
                    </span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removePromo} className="h-8 hover:bg-green-100 hover:text-green-900">
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-₹{discountValue.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total to Pay</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <Button type="submit" form="checkout-form" size="lg" className="w-full" disabled={loading}>
              {loading ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
