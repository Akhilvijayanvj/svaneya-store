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

// Initialize Firebase Admin if not already initialized
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
    const { title, body, image_url, target_type, target_email } = await req.json();

    let tokens: string[] = [];

    if (target_type === 'specific_user' && target_email) {
      const { data, error } = await supabase.from('fcm_tokens').select('token').eq('email', target_email).single();
      if (data && data.token) tokens.push(data.token);
    } else {
      const { data, error } = await supabase.from('fcm_tokens').select('token');
      if (data) tokens = data.map((d: any) => d.token);
    }

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, message: 'No devices found to notify.' }, { status: 404 });
    }

    const payload: MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
        imageUrl: image_url || undefined,
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
      successCount: response.successCount, 
      failureCount: response.failureCount 
    });
  } catch (error: any) {
    console.error("FCM Send Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
