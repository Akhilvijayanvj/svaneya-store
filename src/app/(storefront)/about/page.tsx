import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "About Us | Svaneya",
  description: "Discover the story behind Svaneya's waterproof, anti-tarnish 316L stainless steel jewelry.",
};

export const revalidate = 0;

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'global')
    .single();

  const title = settings?.about_hero_title || "Our Story";
  const subtitle = settings?.about_hero_subtitle || "Redefining everyday luxury with jewelry that lives with you.";
  const storyHtml = settings?.about_story_text || `
    <p>Founded on the belief that fine jewelry shouldn't be confined to a safe, Svaneya was born out of a desire to create pieces that can withstand the rigors of daily life without compromising on elegance.</p>
    <p>We grew tired of the green-tinted skin, the tarnished silver, and the delicate pieces that couldn't survive a simple shower or a workout. We set out to engineer a solution.</p>
    <p>Our collection is meticulously crafted for the modern minimalist. Whether you're in the boardroom, at the gym, or swimming in the ocean, your Svaneya pieces are designed to remain as brilliant as the day you unboxed them.</p>
  `;

  return (
    <div className="bg-white text-slate-900">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/images/necklace.jpg" 
            alt="Svaneya Jewelry Craftsmanship" 
            className="w-full h-full object-cover object-center grayscale"
          />
        </div>
        <div className="container relative z-10 px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading tracking-tight text-white mb-4">
            {title}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light tracking-wide uppercase max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-heading tracking-tight">The Svaneya Philosophy</h2>
            <div 
              className="space-y-6 text-slate-600 leading-relaxed prose prose-slate"
              dangerouslySetInnerHTML={{ __html: storyHtml }}
            />
          </div>
          <div className="aspect-[4/5] bg-slate-50 p-4">
            <div className="w-full h-full bg-slate-200 overflow-hidden relative">
              <img 
                src="/images/necklace.jpg" 
                alt="Minimalist Jewelry" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-24 bg-[#faf9f8] border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-heading tracking-tight">Uncompromising Quality</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We use only the highest grade materials to ensure your pieces last a lifetime.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center border shadow-sm">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 className="font-heading text-xl">316L Stainless Steel</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The core of every piece is marine-grade 316L Surgical Stainless Steel. It is incredibly durable, highly scratch-resistant, and 100% hypoallergenic.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center border shadow-sm">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
              <h3 className="font-heading text-xl">18K PVD Plating</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instead of traditional gold plating which rubs off, we use Physical Vapor Deposition (PVD). This modern plating method binds the 18K gold to the steel at a molecular level.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white flex items-center justify-center border shadow-sm">
                <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              </div>
              <h3 className="font-heading text-xl">Waterproof & Sweatproof</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never take your jewelry off again. Svaneya pieces will not tarnish, fade, or turn your skin green, even when exposed to water, sweat, or lotion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading tracking-tight mb-8">Ready to elevate your everyday?</h2>
          <Link href="/products">
            <Button size="lg" className="px-10 h-14 text-sm tracking-widest uppercase rounded-none bg-slate-900 text-white hover:bg-slate-800">
              Shop The Collection
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
