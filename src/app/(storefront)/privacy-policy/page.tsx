export const metadata = { title: "Privacy Policy | Svaneya" };

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-heading tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          <p>At Svaneya, accessible from svaneya.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Svaneya and how we use it.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Information We Collect</h2>
          <p>We collect information you provide directly to us when you make a purchase, create an account, or contact customer support. This includes your name, email address, phone number, shipping address, and payment information.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain our website and process your orders.</li>
            <li>Improve, personalize, and expand our website.</li>
            <li>Communicate with you, including for customer service and providing order updates.</li>
            <li>Process your transactions securely via our payment partners (Razorpay).</li>
            <li>Find and prevent fraud.</li>
          </ul>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Payment Processing</h2>
          <p>We use Razorpay for processing payments. We do not store your card data on our servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction.</p>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Contact Us</h2>
          <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at support@svaneya.in.</p>
        </div>
      </div>
    </div>
  );
}
