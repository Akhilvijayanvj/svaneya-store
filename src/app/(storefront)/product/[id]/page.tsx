import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ShieldCheck, Droplet, Sparkles } from "lucide-react";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductReviews } from "@/components/product-reviews";
import { ProductGallery } from "@/components/product-gallery";

export const revalidate = 0; // Disable caching to always show latest product data

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_archived', false)
    .single();

  if (!product) {
    notFound();
  }

  const discountPercentage = product.mrp 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12 md:py-24 bg-white text-slate-900">
      <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* Product Images (Left Side) */}
        <div className="w-full md:w-1/2 space-y-4">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Product Info (Right Side) */}
        <div className="w-full md:w-1/2 flex flex-col">
          <nav className="text-[11px] uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href="/products" className="hover:text-black transition-colors">{product.category}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900 truncate max-w-[200px]">{product.name}</span>
          </nav>

          <h1 className="text-4xl lg:text-5xl font-heading tracking-tight mb-2">{product.name}</h1>
          <p className="text-sm text-slate-500 italic mb-8">by Svaneya</p>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-medium">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-lg text-slate-400 line-through">₹{product.mrp}</span>
            )}
          </div>

          <div className="mb-12">
            {/* Stock Warning */}
            {product.stock > 0 && product.stock <= 10 && (
              <div className={`mb-4 text-sm font-medium px-3 py-2 border rounded-sm inline-block ${product.stock <= 3 ? 'text-red-700 bg-red-50 border-red-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
                {product.stock <= 3 ? `Hurry! Only ${product.stock} left in stock` : `Only ${product.stock} left in stock`}
              </div>
            )}

            {product.stock > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <Button size="lg" disabled className="w-full rounded-none bg-slate-100 text-slate-500 text-sm uppercase tracking-widest h-14">
                Out of Stock
              </Button>
            )}
            <p className="text-xs text-slate-500 mt-4 uppercase tracking-widest">
              Free shipping on orders over ₹999. Ships in 24hrs.
            </p>
          </div>

          {/* Specifications Accordion */}
          <div className="pt-12 border-t border-slate-200">
            <h2 className="text-2xl font-heading tracking-tight mb-8 text-center">Specifications</h2>
            
            <Accordion className="w-full" defaultValue={["description"]}>
              <AccordionItem value="certifications" className="border-b border-slate-200 py-2">
                <AccordionTrigger className="text-sm tracking-widest uppercase hover:no-underline hover:text-slate-500 transition-colors">Certifications</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>ISO 9001:2015 Certified Manufacturing</li>
                    <li>SGS Tested Hypoallergenic</li>
                    <li>100% Lead and Nickel Free</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="description" className="border-b border-slate-200 py-2">
                <AccordionTrigger className="text-sm tracking-widest uppercase hover:no-underline hover:text-slate-500 transition-colors">Product Description</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pt-2">
                  <div 
                    className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-heading" 
                    dangerouslySetInnerHTML={{ __html: product.description || "No description provided." }} 
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="features" className="border-b border-slate-200 py-2">
                <AccordionTrigger className="text-sm tracking-widest uppercase hover:no-underline hover:text-slate-500 transition-colors">Features</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pt-2">
                  <div className="grid grid-cols-[120px_1fr] gap-4 text-sm">
                    <span className="font-medium text-slate-900">Material</span>
                    <span>316L Surgical Stainless Steel</span>
                    
                    <span className="font-medium text-slate-900">Finish</span>
                    <span>18K PVD Gold Plating / High Polish Silver</span>
                    
                    <span className="font-medium text-slate-900">Durability</span>
                    <span>Waterproof, Sweatproof, Anti-Tarnish</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="shipping" className="border-b border-slate-200 py-2">
                <AccordionTrigger className="text-sm tracking-widest uppercase hover:no-underline hover:text-slate-500 transition-colors">Shipping & Returns</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pt-2 text-sm">
                  Orders are processed within 24 hours. Free standard shipping on orders over ₹999. If you are not completely satisfied, we offer a 14-day return policy for a full refund or exchange.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews productId={product.id} productName={product.name} />
    </div>
  );
}
