"use server";
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function cancelOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: order } = await supabase.from('orders').select('customer_email, status').eq('id', orderId).single();
  if (!order || order.customer_email !== user.email) throw new Error("Unauthorized");
  if (order.status !== 'pending' && order.status !== 'paid') throw new Error("Cannot cancel this order anymore");

  const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
  if (error) throw new Error(error.message);
  
  // Insert admin notification
  await supabase.from('admin_notifications').insert({
    title: 'Order Cancelled',
    message: `Customer ${user.email} cancelled order #${orderId.split('-')[0]}`,
    order_id: orderId
  });
  
  // Restore stock
  const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity').eq('order_id', orderId);
  if (orderItems && orderItems.length > 0) {
    for (const item of orderItems) {
      // Fetch current stock first to ensure accurate increment
      const { data: product } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
      if (product) {
        const newStock = (product.stock || 0) + item.quantity;
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
      }
    }
  }
  
  revalidatePath('/account');
}

export async function updateOrderAddress(orderId: string, newAddressLine: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const { data: order } = await supabase.from('orders').select('customer_email, status, shipping_address').eq('id', orderId).single();
  if (!order || order.customer_email !== user.email) throw new Error("Unauthorized");
  if (order.status !== 'pending' && order.status !== 'paid') throw new Error("Cannot modify this order anymore");

  const newShippingData = JSON.parse(newAddressLine);
  const newShipping = { ...order.shipping_address, ...newShippingData };
  const { error } = await supabase.from('orders').update({ shipping_address: newShipping }).eq('id', orderId);
  if (error) throw new Error(error.message);
  
  // Insert admin notification
  await supabase.from('admin_notifications').insert({
    title: 'Address Changed',
    message: `Customer ${user.email} updated shipping address for order #${orderId.split('-')[0]}`,
    order_id: orderId
  });
  
  revalidatePath('/account');
}
