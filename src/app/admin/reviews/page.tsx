"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Star, Plus, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Review Form State
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Fetch reviews with product details
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
      
    if (reviewsData) setReviews(reviewsData);

    // Fetch products for dropdown
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name')
      .order('name');
      
    if (productsData) setProducts(productsData);
    setLoading(false);
  }

  async function uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `review_${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
      
    if (uploadError) return null;
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return publicUrl;
  }

  async function handleAddManualReview(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !customerName.trim() || !comment.trim()) return;
    setSubmitting(true);

    let images: string[] = [];
    if (imageFile) {
      const url = await uploadImage(imageFile);
      if (url) images = [url];
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: customerName.trim(),
        rating: parseInt(rating),
        comment: comment.trim(),
        images,
        is_featured: false
      });

    if (error) {
      alert("Failed to add review: " + error.message);
    } else {
      setOpen(false);
      setCustomerName("");
      setComment("");
      setImageFile(null);
      setRating("5");
      fetchData();
    }
    setSubmitting(false);
  }

  async function toggleFeatured(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (!error) {
      setReviews(reviews.map(r => r.id === id ? { ...r, is_featured: !currentStatus } : r));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Reviews</h2>
          <p className="text-muted-foreground">Manage and moderate product reviews.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> Add Manual Review</Button>}>
            Add Manual Review
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Manual Review</DialogTitle>
              <DialogDescription>
                Inject a review on behalf of a customer (e.g., from WhatsApp or Instagram).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddManualReview} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={productId} onValueChange={setProductId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="e.g. Sarah J." />
              </div>
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comment</Label>
                <Textarea value={comment} onChange={e => setComment(e.target.value)} required rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Customer Photo (Optional)</Label>
                <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Review"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="w-[300px]">Review</TableHead>
                <TableHead className="text-center">Featured on Homepage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading reviews...</TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reviews yet.</TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="font-medium">{review.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell className="text-sm">{review.products?.name || "Unknown Product"}</TableCell>
                    <TableCell>
                      <div className="flex text-yellow-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm line-clamp-2">{review.comment}</div>
                      {review.images && review.images.length > 0 && (
                        <a href={review.images[0]} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">View attached image</a>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant={review.is_featured ? "default" : "outline"} 
                        size="sm" 
                        className={review.is_featured ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => toggleFeatured(review.id, review.is_featured)}
                      >
                        {review.is_featured ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1 text-slate-400" />}
                        {review.is_featured ? "Featured" : "No"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
