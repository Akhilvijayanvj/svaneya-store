import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

if (getApps().length === 0) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-admin.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function POST(req: Request) {
  try {
    const { product_id } = await req.json();

    if (!product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 400 });

    // 1. Get product details
    const { data: product } = await supabase.from('products').select('name, images').eq('id', product_id).single();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // 2. Find all users who have this product in their wishlist
    const { data: wishlists } = await supabase.from('wishlists').select('user_email').eq('product_id', product_id);
    if (!wishlists || wishlists.length === 0) {
      return NextResponse.json({ message: 'No users have this product wishlisted.' });
    }
    const emails = wishlists.map(w => w.user_email);

    // 3. Get their FCM tokens
    const { data: tokensData } = await supabase.from('fcm_tokens').select('token').in('email', emails);
    if (!tokensData || tokensData.length === 0) {
      return NextResponse.json({ message: 'Users found, but no Android device tokens registered.' });
    }
    const tokens = tokensData.map(t => t.token);

    // 4. Send the Firebase Push Notification
    const payload: MulticastMessage = {
      tokens,
      notification: {
        title: 'Your wishlist item is back! 🎉',
        body: `Good news! ${product.name} is finally back in stock. Grab it before it sells out again.`,
        imageUrl: (product.images && product.images.length > 0) ? product.images[0] : undefined,
      },
      android: {
        notification: {
          channelId: 'high_importance_channel',
        }
      }
    };

    const response = await getMessaging().sendEachForMulticast(payload);

    return NextResponse.json({
      success: true,
      message: `Restock alert sent to ${response.successCount} devices.`
    });

  } catch (error: any) {
    console.error("Restock API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
