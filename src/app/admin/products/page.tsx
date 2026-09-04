"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    // Fetch products and their associated wishlists
    const { data, error } = await supabase
      .from('products')
      .select('*, wishlists(id)')
      .order('created_at', { ascending: false });
      
    if (data) setProducts(data);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        alert("Failed to delete product: " + error.message);
      } else {
        fetchProducts();
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Link href="/admin/products/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </Link>
      </div>
      
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-center">Wishlists</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-slate-200 rounded"></div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  {product.is_archived && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Hidden</span>}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center justify-center bg-slate-100 px-2 py-1 rounded-full text-xs font-semibold text-slate-700">
                    {product.wishlists ? product.wishlists.length : 0}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found. Add one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
