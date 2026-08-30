"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroImage1, setHeroImage1] = useState("");
  const [heroImage2, setHeroImage2] = useState("");
  const [saleActive, setSaleActive] = useState(false);
  const [saleText, setSaleText] = useState("");
  
  // Page CMS
  const [aboutTitle, setAboutTitle] = useState("Our Story");
  const [aboutSubtitle, setAboutSubtitle] = useState("Redefining everyday luxury with jewelry that lives with you.");
  const [aboutStory, setAboutStory] = useState("");
  const [contactEmail, setContactEmail] = useState("support@svaneya.in");
  const [contactPhone, setContactPhone] = useState("+91 8129975844");
  const [contactAddress, setContactAddress] = useState("Svaneya Studio\\nAdoor, Kerala\\nIndia - 691551");
  const [contactDesc, setContactDesc] = useState("We'd love to hear from you. Whether you have a question about our products, shipping, or need assistance with an order, our team is ready to answer all your questions.");
  
  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'global')
        .single();
        
      if (data) {
        setHeroImage1(data.hero_image_1 || "");
        setHeroImage2(data.hero_image_2 || "");
        setSaleActive(data.sale_active || false);
        setSaleText(data.sale_text || "");
        
        if (data.about_hero_title) setAboutTitle(data.about_hero_title);
        if (data.about_hero_subtitle) setAboutSubtitle(data.about_hero_subtitle);
        if (data.about_story_text) setAboutStory(data.about_story_text);
        if (data.contact_email) setContactEmail(data.contact_email);
        if (data.contact_phone) setContactPhone(data.contact_phone);
        if (data.contact_address) setContactAddress(data.contact_address);
        if (data.contact_description) setContactDesc(data.contact_description);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageNum: 1 | 2) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Using the same product-images bucket for convenience
    const fileExt = file.name.split('.').pop();
    const fileName = `hero_${imageNum}_${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
      
    if (uploadError) {
      alert(`Error uploading image: ${uploadError.message}`);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
      
    if (imageNum === 1) setHeroImage1(publicUrl);
    if (imageNum === 2) setHeroImage2(publicUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Upsert the settings
    const { error } = await supabase
      .from('store_settings')
      .upsert({ 
        id: 'global', 
        hero_image_1: heroImage1, 
        hero_image_2: heroImage2,
        sale_active: saleActive,
        sale_text: saleText,
        about_hero_title: aboutTitle,
        about_hero_subtitle: aboutSubtitle,
        about_story_text: aboutStory,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        contact_description: contactDesc,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
    setSaving(false);
    
    if (error) {
      alert(`Error saving settings. Did you run the SQL to add the new columns? ${error.message || JSON.stringify(error)}`);
      console.error(error);
    } else {
      alert("Settings saved successfully!");
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
          <p className="text-muted-foreground">Manage your store's appearance and configuration.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="px-8">
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Accordion className="w-full" defaultValue="hero">
            
            <AccordionItem value="hero" className="border-b px-6 py-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Hero Section Images</h3>
                  <p className="text-sm font-normal text-muted-foreground">Update the full-screen image that appears on the homepage hero section.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="max-w-xl space-y-4">
                  <div className="aspect-video bg-slate-100 rounded-md overflow-hidden relative border border-dashed border-slate-300">
                    {heroImage1 ? (
                      <img src={heroImage1} className="w-full h-full object-cover" alt="Hero 1" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <p className="text-sm">Using default AI image</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input 
                      type="file" 
                      id="hero1" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 1)}
                    />
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('hero1')?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Upload Hero Image
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sale" className="border-b px-6 py-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Sale Announcement Banner</h3>
                  <p className="text-sm font-normal text-muted-foreground">Enable a scrolling announcement bar at the top of the homepage.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-6">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="saleActive" 
                    className="h-4 w-4 rounded border-gray-300 text-slate-900 focus:ring-slate-900"
                    checked={saleActive}
                    onChange={(e) => setSaleActive(e.target.checked)}
                  />
                  <label htmlFor="saleActive" className="text-sm font-medium leading-none">
                    Enable Sale Banner
                  </label>
                </div>
                
                <div className="space-y-2 max-w-xl">
                  <label htmlFor="saleText" className="text-sm font-medium">Announcement Text</label>
                  <input 
                    type="text" 
                    id="saleText"
                    placeholder="e.g. 🚨 CHRISTMAS SALE! 50% OFF EVERYTHING 🚨"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    value={saleText}
                    onChange={(e) => setSaleText(e.target.value)}
                    disabled={!saleActive}
                  />
                  <p className="text-xs text-muted-foreground">This text will continuously scroll across the top of the homepage.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="about" className="border-b px-6 py-2">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">About Us Page Content</h3>
                  <p className="text-sm font-normal text-muted-foreground">Manage the copy on your About Us page.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Title</label>
                    <input type="text" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Subtitle</label>
                    <input type="text" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={aboutSubtitle} onChange={e => setAboutSubtitle(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Our Story (Philosophy)</label>
                  <RichTextEditor value={aboutStory} onChange={(val) => setAboutStory(val)} />
                  <p className="text-xs text-muted-foreground">Use the editor to add paragraphs, bold text, etc. This replaces the philosophy text on the About page.</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="px-6 py-2 border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Contact Page & Footer Details</h3>
                  <p className="text-sm font-normal text-muted-foreground">Update your contact information across the site.</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Support Email</label>
                    <input type="email" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input type="text" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">HQ Address</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm" value={contactAddress} onChange={e => setContactAddress(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Use line breaks to format your address.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Page Description</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm" value={contactDesc} onChange={e => setContactDesc(e.target.value)} />
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
