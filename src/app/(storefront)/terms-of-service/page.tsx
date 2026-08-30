export const metadata = { title: "Terms of Service | Svaneya" };

export default function TermsPage() {
  return (
    <div className="bg-white text-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-heading tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">1. Introduction</h2>
          <p>Welcome to Svaneya. These Terms of Service govern your use of our website located at svaneya.in operated by Svaneya Studio.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">2. Products and Pricing</h2>
          <p>All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change without notice.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">3. Billing and Account Information</h2>
          <p>We reserve the right to refuse any order you place with us. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</p>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">4. Shipping and Delivery</h2>
          <p>We aim to process and ship all orders within 24-48 hours. Delivery times vary by location. Svaneya is not responsible for delays caused by the carrier or customs clearance.</p>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">5. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
        </div>
      </div>
    </div>
  );
}
