"use client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useState } from "react";

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const [added, setAdded] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);

  const cartItem = items.find(i => i.id === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;
  
  // The maximum they can add right now is the total stock minus what's already in the cart
  const maxAvailableToAdd = Math.max(0, product.stock - currentQty);
  const isMaxReached = maxAvailableToAdd === 0;

  const handleAddToCart = () => {
    if (isMaxReached || selectedQty < 1 || selectedQty > maxAvailableToAdd) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      quantity: selectedQty,
      stock: product.stock,
    });
    setAdded(true);
    setSelectedQty(1);
    setTimeout(() => setAdded(false), 2000);
  };

  const increment = () => {
    if (selectedQty < maxAvailableToAdd) setSelectedQty(q => q + 1);
  };

  const decrement = () => {
    if (selectedQty > 1) setSelectedQty(q => q - 1);
  };

  return (
    <div className="flex gap-4 items-center w-full">
      <div className="flex items-center border border-slate-200 h-14 bg-white">
        <Button variant="ghost" size="icon" className="h-full rounded-none px-4 hover:bg-slate-100 disabled:opacity-50" onClick={decrement} disabled={selectedQty <= 1 || isMaxReached}>
          <span className="text-xl leading-none">-</span>
        </Button>
        <span className="w-8 text-center text-sm font-medium">{isMaxReached ? 0 : selectedQty}</span>
        <Button variant="ghost" size="icon" className="h-full rounded-none px-4 hover:bg-slate-100 disabled:opacity-50" onClick={increment} disabled={selectedQty >= maxAvailableToAdd || isMaxReached}>
          <span className="text-xl leading-none">+</span>
        </Button>
      </div>
      
      <Button 
        size="lg" 
        onClick={handleAddToCart} 
        disabled={isMaxReached}
        className="flex-1 text-sm uppercase tracking-widest h-14 rounded-none bg-black text-white hover:bg-slate-800 transition-colors shadow-none disabled:bg-slate-300 disabled:text-slate-500"
      >
        {isMaxReached ? (
          <span>Max Stock Reached</span>
        ) : added ? (
          <span className="flex items-center">
            <Check className="mr-2 h-5 w-5" /> Added to Cart
          </span>
        ) : (
          <span className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </span>
        )}
      </Button>
    </div>
  );
}
