import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/product-card";
import { Search } from "lucide-react";

export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const query = (await searchParams).q as string;
  const supabase = await createClient();
  
  let products = [];
  
  if (query) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
      
    if (data) products = data;
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-heading tracking-tight mb-2">
            {query ? `Search Results for "${query}"` : "Search Our Store"}
          </h1>
          <p className="text-slate-500">
            {query ? `Found ${products.length} product${products.length === 1 ? '' : 's'}` : "Enter a search term above to find products."}
          </p>
        </div>

        {!query ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Search className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-lg">What are you looking for?</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Search className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-lg">No products match your search.</p>
            <p className="text-sm mt-2">Try using different or more general keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
