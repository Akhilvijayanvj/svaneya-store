'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FUNNY_TEMPLATES = [
  {
    title: "Your wishlist is crying 😢",
    body: "It's lonely in there. Bring a ring home today and get 15% off!",
    image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=3000&auto=format&fit=crop"
  },
  {
    title: "Alert: Drop dead gorgeous jewelry spotted 🚨",
    body: "Our new arrivals just dropped. Don't let your friends look better than you.",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=3000&auto=format&fit=crop"
  },
  {
    title: "Did you forget something? 🤔",
    body: "We saw you looking at those earrings. They want you too.",
    image_url: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?q=80&w=3000&auto=format&fit=crop"
  }
];

export default function NotificationsAdmin() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState('all_users');
  const [targetEmail, setTargetEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const applyTemplate = (index: number) => {
    const t = FUNNY_TEMPLATES[index];
    setTitle(t.title);
    setBody(t.body);
    setImageUrl(t.image_url);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Sending...');

    const payload = {
      title,
      body,
      image_url: imageUrl,
      target_type: targetType,
      target_email: targetType === 'specific_user' ? targetEmail : null,
    };

    // 1. Log to database
    const { error } = await supabase.from('notifications').insert([payload]);

    if (error) {
      setStatus(`DB Error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    // 2. Trigger FCM Push Notification
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setStatus(`Sent! Reached ${data.successCount} devices. (${data.failureCount} failed)`);
        setTitle('');
        setBody('');
        setImageUrl('');
        setTargetEmail('');
      } else {
        setStatus(`Push Failed: ${data.message || data.error}`);
      }
    } catch (err: any) {
      setStatus(`API Error: ${err.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif">Push Notifications</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSend} className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
            
            <div className="flex gap-4 mb-6">
              <button type="button" onClick={() => applyTemplate(0)} className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-100 transition">Template 1</button>
              <button type="button" onClick={() => applyTemplate(1)} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition">Template 2</button>
              <button type="button" onClick={() => applyTemplate(2)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition">Template 3</button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notification Title</label>
              <input 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border p-3 rounded-lg" 
                placeholder="e.g. 50% OFF Flash Sale!" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Notification Body</label>
              <textarea 
                required 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                className="w-full border p-3 rounded-lg h-24" 
                placeholder="Make it funny and creative..." 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
              <input 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="w-full border p-3 rounded-lg" 
                placeholder="https://example.com/image.jpg" 
              />
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <select 
                value={targetType} 
                onChange={(e) => setTargetType(e.target.value)} 
                className="w-full border p-3 rounded-lg mb-4"
              >
                <option value="all_users">Broadcast to Everyone (All Users)</option>
                <option value="specific_user">Specific User (Email)</option>
              </select>

              {targetType === 'specific_user' && (
                <input 
                  required 
                  type="email"
                  value={targetEmail} 
                  onChange={(e) => setTargetEmail(e.target.value)} 
                  className="w-full border p-3 rounded-lg mb-4" 
                  placeholder="customer@example.com" 
                />
              )}
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Push Notification 🚀'}
            </button>
            
            {status && <p className="text-center font-medium mt-4 text-green-600">{status}</p>}
          </form>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-gray-500 uppercase text-sm tracking-wider">Preview</h3>
          <div className="bg-gray-100 w-full h-[600px] rounded-[3rem] border-[8px] border-gray-800 p-4 relative overflow-hidden flex flex-col shadow-2xl">
            {/* Phone notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl"></div>
            
            {/* Notification Banner */}
            <div className="mt-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 animate-fade-in-down">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">S</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 uppercase">Svaneya</span>
                <span className="text-xs text-gray-400 ml-auto">now</span>
              </div>
              <h4 className="font-bold text-sm text-black leading-tight mb-1">{title || 'Notification Title'}</h4>
              <p className="text-xs text-gray-600 leading-snug">{body || 'This is how your notification will look on the customer\'s phone.'}</p>
              
              {imageUrl && (
                <div className="mt-3 w-full h-32 rounded-lg bg-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
