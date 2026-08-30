"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setCategories(data);
    setLoading(false);
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `category_${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
      
    if (uploadError) {
      alert(`Error uploading image: ${uploadError.message}`);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    return publicUrl;
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setAdding(true);

    let imageUrl = null;
    if (newImageFile) {
      imageUrl = await uploadImage(newImageFile);
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: newCategoryName.trim(), image_url: imageUrl })
      .select()
      .single();

    if (error) {
      alert("Failed to add category. Did you run the SQL to add the image_url column? " + error.message);
    } else if (data) {
      setCategories([data, ...categories]);
      setNewCategoryName('');
      setNewImageFile(null);
    }
    setAdding(false);
  }

  async function handleUpdateCategory(id: string) {
    if (!editName.trim()) return;
    setUpdating(true);

    let imageUrl = categories.find(c => c.id === id)?.image_url;
    if (editImageFile) {
      const uploadedUrl = await uploadImage(editImageFile);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from('categories')
      .update({ name: editName.trim(), image_url: imageUrl })
      .eq('id', id);

    if (error) {
      alert("Failed to update category: " + error.message);
    } else {
      setCategories(categories.map(c => c.id === id ? { ...c, name: editName.trim(), image_url: imageUrl } : c));
      setEditingId(null);
      setEditImageFile(null);
    }
    setUpdating(false);
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Failed to delete category: " + error.message);
    } else {
      setCategories(categories.filter(c => c.id !== id));
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground">Manage your product categories and thumbnails.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Optionally upload an image. If left blank, it will automatically use a product image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label>Category Name</Label>
              <Input 
                placeholder="e.g. Necklaces" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2 flex-1 w-full">
              <Label>Category Image (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <Button type="submit" disabled={adding || !newCategoryName.trim()}>
              {adding ? "Adding..." : <><Plus className="h-4 w-4 mr-2" /> Add</>}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading categories...</TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No categories found.</TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingId === category.id ? (
                         <div className="relative w-12 h-12 bg-slate-100 rounded-md overflow-hidden group">
                           {category.image_url || editImageFile ? (
                             <img src={editImageFile ? URL.createObjectURL(editImageFile) : category.image_url} className="w-full h-full object-cover" alt="thumb" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="h-4 w-4"/></div>
                           )}
                           <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer text-white">
                              <Upload className="h-4 w-4" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files) setEditImageFile(e.target.files[0]) }} />
                           </label>
                         </div>
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400 text-center px-1">Auto</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === category.id ? (
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="max-w-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdateCategory(category.id);
                            if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditImageFile(null);
                            }
                          }}
                        />
                      ) : (
                        <span className="font-medium">{category.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {editingId === category.id ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateCategory(category.id)} disabled={updating}>{updating ? "Saving" : "Save"}</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setEditImageFile(null); }} disabled={updating}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
