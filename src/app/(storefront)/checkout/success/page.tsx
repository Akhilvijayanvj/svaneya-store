"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const email = searchParams.get("email");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data.user) setIsLoggedIn(true);
    }
    checkAuth();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white border rounded-xl shadow-sm text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-6">
        Thank you for your purchase. Your payment was successful.
      </p>
      
      {orderId && (
        <div className="bg-slate-50 p-4 rounded-lg mb-8 text-sm">
          <span className="text-muted-foreground block mb-1">Order ID</span>
          <span className="font-mono font-medium">{orderId}</span>
        </div>
      )}

      <div className="space-y-4">
        {isLoggedIn ? (
          <Link href="/account" className="block w-full">
            <Button size="lg" className="w-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700">
              <Package className="mr-2 h-5 w-5" />
              Track Order
            </Button>
          </Link>
        ) : (
          <Link href={`/login?email=${encodeURIComponent(email || '')}&intent=track`} className="block w-full">
            <Button size="lg" className="w-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700">
              <Package className="mr-2 h-5 w-5" />
              Create Account to Track Order
            </Button>
          </Link>
        )}
        
        <Link href="/" className="block w-full">
          <Button variant="outline" size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 min-h-[70vh]">
      <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
