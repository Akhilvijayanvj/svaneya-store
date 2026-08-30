"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: "support@svaneya.in",
    phone: "+91 8129975844",
    address: "Svaneya Studio\nAdoor, Kerala\nIndia - 691551",
    desc: "We'd love to hear from you. Whether you have a question about our products, shipping, or need assistance with an order, our team is ready to answer all your questions."
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 'global').single();
      if (data) {
        setContactInfo({
          email: data.contact_email || "support@svaneya.in",
          phone: data.contact_phone || "+91 8129975844",
          address: data.contact_address || "Svaneya Studio\nAdoor, Kerala\nIndia - 691551",
          desc: data.contact_description || "We'd love to hear from you. Whether you have a question about our products, shipping, or need assistance with an order, our team is ready to answer all your questions."
        });
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-heading tracking-tight mb-4">Contact Us</h1>
          <p className="text-slate-500 text-lg">
            {contactInfo.desc}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-heading tracking-tight mb-6">Get In Touch</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Our customer service team is available Monday through Friday, 9:00 AM to 5:00 PM (IST). We typically respond to all inquiries within 24 hours.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                  <Mail className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm uppercase tracking-widest mb-1">Email</h3>
                  <a href={`mailto:${contactInfo.email}`} className="text-slate-600 hover:text-black transition-colors">{contactInfo.email}</a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                  <Phone className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm uppercase tracking-widest mb-1">Phone</h3>
                  <a href={`tel:${contactInfo.phone}`} className="text-slate-600 hover:text-black transition-colors">{contactInfo.phone}</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 text-sm uppercase tracking-widest mb-1">Headquarters</h3>
                  <p className="text-slate-600 whitespace-pre-line">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-8 md:p-10 border border-slate-100">
            <h2 className="text-2xl font-heading tracking-tight mb-8">Send a Message</h2>
            
            {success ? (
              <div className="bg-green-50 text-green-800 p-6 rounded-md border border-green-200 text-center">
                <h3 className="font-medium mb-2">Message Sent!</h3>
                <p className="text-sm">Thank you for reaching out. We will get back to you as soon as possible.</p>
                <Button 
                  variant="outline" 
                  className="mt-6 bg-white" 
                  onClick={() => setSuccess(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required className="bg-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required className="bg-white" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                  <Input id="orderNumber" className="bg-white" placeholder="#e6d09..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required className="bg-white min-h-[150px]" placeholder="How can we help you today?" />
                </div>

                <Button type="submit" className="w-full rounded-none h-12 uppercase tracking-widest text-xs font-medium" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
