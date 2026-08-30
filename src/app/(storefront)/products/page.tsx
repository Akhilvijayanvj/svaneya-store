import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/product-card";

export const revalidate = 0; // Disable caching

export default async function ProductsCatalogPage() {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const userEmail = user?.email;

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex flex-col space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">All Jewelry</h1>
        <p className="text-muted-foreground md:text-lg">
          Browse our complete collection of waterproof, anti-tarnish jewelry.
        </p>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:gap-x-8 lg:gap-y-14">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} userEmail={userEmail} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl">
              No products found in this category.
            </div>
          )}
        </div>
    </div>
  );
}
