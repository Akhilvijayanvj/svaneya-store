import { createClient } from '@/utils/supabase/server';
import MobileBannersManager from './MobileBannersManager';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function MobileBannersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: banners } = await supabase
    .from('mobile_banners')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mobile App Banners</h1>
        <p className="text-slate-500 mt-2">Manage the auto-sliding hero carousel in the Flutter app. Upload up to 4 images.</p>
      </div>
      
      <MobileBannersManager initialBanners={banners || []} />
    </div>
  );
}
