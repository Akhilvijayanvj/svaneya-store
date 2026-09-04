export const metadata = { title: "Shipping & Delivery Policy | Svaneya" };

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white text-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-heading tracking-tight mb-8">Shipping & Delivery Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          <p>At Svaneya, we strive to deliver your premium jewelry as quickly and safely as possible. This policy outlines our shipping procedures, costs, and timelines.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Order Processing Time</h2>
          <p>All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Domestic Shipping Rates and Estimates</h2>
          <p>We offer flat-rate shipping across India. Shipping charges for your order will be calculated and displayed at checkout.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Shipping:</strong> ₹50 (3-5 business days)</li>
            <li><strong>Free Shipping:</strong> On all orders over ₹999</li>
          </ul>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">How do I check the status of my order?</h2>
          <p>When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.</p>
          <p>If you haven’t received your order within 7 days of receiving your shipping confirmation email, please contact us at support@svaneya.in with your name and order number, and we will look into it for you.</p>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Contact Us</h2>
          <p>If you have any further questions regarding shipping, please don't hesitate to contact us at support@svaneya.in or +91 8129975844.</p>
        </div>
      </div>
    </div>
  );
}
