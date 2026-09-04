import Link from "next/link";
import { Sparkles, MapPin, Mail, Phone } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Footer() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'global')
    .single();

  const email = settings?.contact_email || "support@svaneya.in";
  const phone = settings?.contact_phone || "+91 8129975844";
  const address = settings?.contact_address || "Svaneya Studio\nAdoor, Kerala\nIndia - 691551";

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold tracking-tight">Svaneya</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Premium 316L skin-friendly, anti-tarnish jewelry. Crafted for everyday elegance, designed to last a lifetime.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Shop</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/products" className="hover:text-white transition-colors">All Jewelry</Link></li>
            <li><Link href="/products?category=Necklaces" className="hover:text-white transition-colors">Necklaces</Link></li>
            <li><Link href="/products?category=Rings" className="hover:text-white transition-colors">Rings</Link></li>
            <li><Link href="/products?category=Earrings" className="hover:text-white transition-colors">Earrings</Link></li>
            <li><Link href="/products?category=Bracelets" className="hover:text-white transition-colors">Bracelets</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Customer Care</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/account" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{address}</span>
            </li>
            <li className="flex gap-3 items-center">
              <Mail className="h-5 w-5 text-slate-500 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
            </li>
            <li className="flex gap-3 items-center">
              <Phone className="h-5 w-5 text-slate-500 shrink-0" />
              <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Svaneya. All rights reserved.</p>
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}
