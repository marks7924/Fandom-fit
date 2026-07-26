import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function verifyHMAC(payload: any, hmacReceived: string, hmacSecret: string): boolean {
  if (!hmacSecret) return false;
  
  const obj = payload.obj || payload;
  const fields = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_voided,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.pending,
    obj.success,
  ];
  
  const hmacString = fields.join('');
  const calculatedHmac = crypto
    .createHmac('sha512', hmacSecret)
    .update(hmacString)
    .digest('hex');
    
  return calculatedHmac === hmacReceived;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const success = searchParams.get('success') === 'true';
    const orderCode = searchParams.get('merchant_order_id') || searchParams.get('order') || searchParams.get('order_id') || '';
    
    // Redirect to local status verification page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const redirectUrl = `${baseUrl}/payment/status-check?order_code=${orderCode}&success=${success}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Paymob redirect handler error:', error);
    return NextResponse.json({ success: false, error: 'Redirect failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hmacReceived = searchParams.get('hmac') || '';
    const payload = await request.json();

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    if (isMock) {
      // In mock mode, skip verify & return success
      return NextResponse.json({ success: true, message: 'Mock payload received' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'payment_settings').maybeSingle();
    const paymentSettings = typeof settingsData?.value === 'string' ? JSON.parse(settingsData.value) : settingsData?.value;

    const hmacSecret = paymentSettings?.paymob_hmac_secret || '';
    const isVerified = verifyHMAC(payload, hmacReceived, hmacSecret);

    if (!isVerified) {
      console.warn('Paymob webhook HMAC verification failed');
      return NextResponse.json({ success: false, error: 'Invalid HMAC signature' }, { status: 400 });
    }

    const txn = payload.obj;
    if (!txn) {
      return NextResponse.json({ success: false, error: 'Missing transaction object' }, { status: 400 });
    }

    const orderCode = txn.order?.merchant_order_id || txn.order?.id;
    const isSuccess = txn.success === true;
    const newStatus = isSuccess ? 'paid' : 'payment_failed';

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_code', orderCode);

    if (updateErr) {
      console.error('Failed to update order status via Paymob webhook:', updateErr);
      return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderCode, status: newStatus });
  } catch (error: any) {
    console.error('Paymob webhook error:', error);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}
