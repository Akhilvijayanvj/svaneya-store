"use client";
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { useEffect } from "react";

export function ProductGallery({ images, productName }: { images: string[], productName: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] relative overflow-hidden bg-[#fcfcfc] flex items-center justify-center text-slate-400">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((img: string, idx: number) => (
            <CarouselItem key={idx}>
              <div className="aspect-[4/5] relative overflow-hidden bg-[#fcfcfc] transition-colors hover:bg-[#f5f5f5]">
                <img 
                  src={img} 
                  alt={`${productName} - Image ${idx + 1}`} 
                  className="object-contain w-full h-full mix-blend-multiply p-8"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4 bg-white/50 hover:bg-white" />
            <CarouselNext className="right-4 bg-white/50 hover:bg-white" />
          </>
        )}
      </Carousel>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <button 
              key={idx} 
              onClick={() => scrollTo(idx)}
              className={`w-20 h-24 flex-shrink-0 bg-[#fcfcfc] hover:bg-[#f5f5f5] transition-all border ${current === idx ? 'border-slate-900 ring-1 ring-slate-900' : 'border-transparent hover:border-slate-200'}`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain mix-blend-multiply p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
