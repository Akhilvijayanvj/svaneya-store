export const metadata = { title: "Refund Policy | Svaneya" };

export default function RefundPolicyPage() {
  return (
    <div className="bg-white text-slate-900 py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-heading tracking-tight mb-8">Refund & Cancellation Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6">
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Returns & Exchanges</h2>
          <p>We want you to love your Svaneya jewelry! If you are not completely satisfied with your purchase, we accept returns and exchanges within 14 days of delivery.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Items must be unused and in the same condition that you received them.</li>
            <li>Items must be in the original packaging.</li>
            <li>Customized or engraved items are strictly non-refundable.</li>
          </ul>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Cancellations</h2>
          <p>You may cancel your order at any time before it is shipped. If the order has already been dispatched, you will need to follow the standard return process once you receive the package.</p>
          
          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Refunds</h2>
          <p>Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund. If approved, the refund will be processed back to your original method of payment (via Razorpay) within 5-7 business days.</p>

          <h2 className="text-xl font-heading text-slate-900 mt-8 mb-4">Shipping Costs for Returns</h2>
          <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
        </div>
      </div>
    </div>
  );
}
