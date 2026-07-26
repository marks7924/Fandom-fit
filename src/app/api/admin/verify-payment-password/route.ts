import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
    }

    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    // 1. Check process.env password or default ch222ch222
    const envPassword = process.env.PAYMENT_SETTINGS_PASSWORD || 'ch222ch222';
    const envHash = crypto.createHash('sha256').update(envPassword).digest('hex');

    if (inputHash === envHash) {
      return NextResponse.json({ success: true, token: crypto.randomUUID() });
    }

    // 2. Check Database settings for password hash override
    if (supabaseUrl && supabaseServiceKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'payment_settings_password_hash')
        .maybeSingle();

      if (data?.value && inputHash === data.value) {
        return NextResponse.json({ success: true, token: crypto.randomUUID() });
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error: any) {
    console.error('Password verification error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
