'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trash2, Upload, GripVertical, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileBannersManager({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState(initialBanners);
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (banners.length >= 4) {
      alert("You can only have up to 4 banners.");
      return;
    }

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      const { data: newBanner, error: insertError } = await supabase
        .from('mobile_banners')
        .insert({
          image_url: publicUrl,
          sort_order: banners.length
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setBanners([...banners, newBanner]);
      router.refresh();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('mobile_banners').delete().eq('id', id);
      setBanners(banners.filter(b => b.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Current Banners ({banners.length}/4)</h2>
        
        {banners.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
            <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">No banners uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner, index) => (
              <div key={banner.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-[2/1]">
                <img src={banner.image_url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Upload New Banner</h2>
        <div className="flex items-center justify-center w-full">
          <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${banners.length >= 4 ? 'bg-slate-100 border-slate-300 cursor-not-allowed' : 'bg-slate-50 border-slate-300 hover:bg-slate-100'}`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2"></div>
              ) : (
                <Upload className="w-8 h-8 mb-4 text-slate-500" />
              )}
              <p className="mb-2 text-sm text-slate-500">
                <span className="font-semibold">{isUploading ? 'Uploading...' : 'Click to upload'}</span> {!isUploading && 'or drag and drop'}
              </p>
              <p className="text-xs text-slate-500">PNG, JPG or WEBP (Max 4 banners)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={isUploading || banners.length >= 4}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
