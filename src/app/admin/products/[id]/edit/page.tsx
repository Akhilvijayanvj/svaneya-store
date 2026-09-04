"use client";
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/rich-text-editor';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalStock, setOriginalStock] = useState<number>(0);
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    mrp: '',
    stock: '',
    category: '',
    is_best_seller: false,
    is_new_arrival: false,
    is_special_edition: false,
    is_archived: false,
    badge_text: '',
    badge_bg: '#0f172a',
    badge_text_color: '#ffffff'
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function getProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
        
      if (data) {
        setOriginalStock(data.stock || 0);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price ? data.price.toString() : '',
          mrp: data.mrp ? data.mrp.toString() : '',
          stock: data.stock ? data.stock.toString() : '',
          category: data.category || '',
          is_best_seller: data.is_best_seller || false,
          is_new_arrival: data.is_new_arrival || false,
          is_special_edition: data.is_special_edition || false,
          is_archived: data.is_archived || false,
          badge_text: data.badge_text || '',
          badge_bg: data.badge_bg || '#0f172a',
          badge_text_color: data.badge_text_color || '#ffffff'
        });
      }
      
      const { data: catData } = await supabase.from('categories').select('name');
      if (catData) setCategories(catData);
      
      setFetching(false);
    }
    getProduct();
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatePayload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        stock: parseInt(formData.stock),
        category: formData.category,
        is_best_seller: formData.is_best_seller,
        is_new_arrival: formData.is_new_arrival,
        is_special_edition: formData.is_special_edition,
        is_archived: formData.is_archived,
        badge_text: formData.badge_text || null,
        badge_bg: formData.badge_bg,
        badge_text_color: formData.badge_text_color
      };

      if (imageFiles.length > 0) {
        let imageUrls: string[] = [];
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          imageUrls.push(data.publicUrl);
        }
        updatePayload.images = imageUrls;
      }

      if (formData.category) {
        await supabase.from('categories').insert({ name: formData.category.trim() });
      }

      const { data, error: dbError } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', resolvedParams.id)
        .select();

      if (dbError) throw dbError;
      if (!data || data.length === 0) throw new Error("Update failed: You do not have permission to edit this product.");

      // Intelligent Notification Automation: Wishlist Restock
      if (originalStock === 0 && parseInt(formData.stock) > 0) {
        try {
          fetch('/api/cron/restock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: resolvedParams.id })
          }); // Fire and forget so we don't block the UI
        } catch (e) {
          console.error("Failed to trigger restock automation", e);
        }
      }

      alert("Product updated successfully!");
      router.push('/admin/products');
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.message || JSON.stringify(error) || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center py-12">Loading product data...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor 
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₹)</Label>
                <Input id="price" name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP (₹)</Label>
                <Input id="mrp" name="mrp" type="number" step="0.01" value={formData.mrp} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" required value={formData.stock} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex flex-col gap-2">
                  <select 
                    id="category-select"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <Input 
                    id="category-new" 
                    placeholder="Or type a new category..." 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Replace Product Images</Label>
              <Input id="image" name="image" type="file" accept="image/*" multiple onChange={handleImageChange} />
              <p className="text-xs text-muted-foreground">Selecting new images will replace the existing ones. Leave blank to keep current images.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-slate-100">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_best_seller" 
                  name="is_best_seller"
                  className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  checked={formData.is_best_seller}
                  onChange={handleChange}
                />
                <label htmlFor="is_best_seller" className="text-sm font-medium leading-none">
                  Best Seller
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_new_arrival" 
                  name="is_new_arrival"
                  className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  checked={formData.is_new_arrival}
                  onChange={handleChange}
                />
                <label htmlFor="is_new_arrival" className="text-sm font-medium leading-none">
                  New Arrival
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_special_edition" 
                  name="is_special_edition"
                  className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  checked={formData.is_special_edition}
                  onChange={handleChange}
                />
                <label htmlFor="is_special_edition" className="text-sm font-medium leading-none">
                  Special Edition
                </label>
              </div>
              
              <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                <input 
                  type="checkbox" 
                  id="is_archived" 
                  name="is_archived"
                  className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                  checked={formData.is_archived}
                  onChange={handleChange}
                />
                <label htmlFor="is_archived" className="text-sm font-medium leading-none text-red-600">
                  Archive / Hide Product (Will not appear on storefront)
                </label>
              </div>
            </div>

            <div className="space-y-4 pb-4">
              <div className="space-y-2">
                <Label htmlFor="badge_text">Custom Badge Text (Optional)</Label>
                <Input id="badge_text" name="badge_text" placeholder="e.g. HIGH DEMAND" value={formData.badge_text} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">This text will appear in a bubble over the product image.</p>
              </div>

              {formData.badge_text && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                  <div className="space-y-2">
                    <Label htmlFor="badge_bg">Badge Background</Label>
                    <Input id="badge_bg" name="badge_bg" placeholder="e.g. #FF0000 or linear-gradient(...)" value={formData.badge_bg} onChange={handleChange} />
                    <p className="text-[10px] text-muted-foreground">Accepts HEX code or CSS gradient.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge_text_color">Badge Text Color</Label>
                    <Input id="badge_text_color" name="badge_text_color" type="color" className="h-10 px-1 py-1 w-full" value={formData.badge_text_color} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving Changes..." : "Update Product"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
