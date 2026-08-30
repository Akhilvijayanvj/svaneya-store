"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Star, MessageSquare, ImageIcon, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ProductReviews({ productId, productName }: { productId: string, productName: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    setSubmitting(true);

    let images: string[] = [];
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `review_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        images = [publicUrl];
      }
    }

    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      customer_name: name.trim(),
      rating,
      comment: comment.trim(),
      images,
      is_featured: false
    });

    setSubmitting(false);
    if (!error) {
      setSuccess(true);
      fetchReviews();
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setName("");
        setComment("");
        setImageFile(null);
        setRating(5);
      }, 2000);
    } else {
      alert("Error submitting review: " + error.message);
    }
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-24 pt-16 border-t border-slate-100 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-heading tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "text-slate-200"}`} />
              ))}
            </div>
            <span className="text-lg font-medium">{averageRating} out of 5</span>
            <span className="text-slate-400">({reviews.length} reviews)</span>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button size="lg" className="rounded-none bg-slate-950 text-white uppercase tracking-widest text-xs px-8 hover:bg-slate-800" />
            }
          >
            Write a Review
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Review {productName}</DialogTitle>
            </DialogHeader>
            {success ? (
              <div className="py-12 flex flex-col items-center text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Thank you!</h3>
                <p className="text-slate-500">Your review has been successfully submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="flex justify-center space-x-2 py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`transition-colors ${i < rating ? "text-yellow-500" : "text-slate-200 hover:text-yellow-200"}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Sarah M." className="rounded-none h-12" />
                </div>
                
                <div className="space-y-2">
                  <Label>Review</Label>
                  <Textarea value={comment} onChange={e => setComment(e.target.value)} required placeholder="What did you like about it?" className="rounded-none resize-none" rows={4} />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-dashed border-slate-300 p-4 justify-center hover:bg-slate-100 transition-colors">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600">{imageFile ? imageFile.name : "Add a Photo (Optional)"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                  </Label>
                </div>
                
                <Button type="submit" className="w-full h-12 rounded-none bg-slate-950 uppercase tracking-widest text-xs" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12 text-slate-400"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Be the first to share your thoughts about the {productName}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-[#fcfcfc] p-6 border border-slate-100 transition-colors hover:border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold font-heading text-lg">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 leading-none">{review.customer_name}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="mt-4 rounded overflow-hidden max-w-[150px]">
                    <img src={review.images[0]} alt="Customer photo" className="w-full h-auto object-cover hover:opacity-90 transition-opacity cursor-pointer" onClick={() => window.open(review.images[0], '_blank')} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
