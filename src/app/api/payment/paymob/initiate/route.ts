import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { orderId, paymentMethod } = await request.json(); // paymentMethod: 'card' | 'fawry'
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    let order: any = null;
    let paymentSettings: any = null;

    if (!isMock) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: orderData } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
      order = orderData;
      
      const { data: settingsData } = await supabase.from('settings').select('value').eq('key', 'payment_settings').maybeSingle();
      paymentSettings = typeof settingsData?.value === 'string' ? JSON.parse(settingsData.value) : settingsData?.value;
    }

    // Default mock behavior if mock mode or Paymob API keys are missing
    const hasKeys = paymentSettings?.paymob_api_key && paymentSettings?.paymob_enabled;
    if (isMock || !hasKeys) {
      // Simulate mock checkout
      const paymentToken = `mock-token-${Math.random().toString(36).substring(7)}`;
      const mockUrl = `/payment/mock-paymob?payment_token=${paymentToken}&order_id=${orderId}&method=${paymentMethod || 'card'}`;
      return NextResponse.json({ success: true, redirectUrl: mockUrl });
    }

    // Connect to real Paymob API Accept Payment
    const apiKey = paymentSettings.paymob_api_key;
    const integrationId = paymentMethod === 'fawry' 
      ? paymentSettings.paymob_integration_id_fawry 
      : paymentSettings.paymob_integration_id_card;

    // 1. Authenticate to get Accept token
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    const authData = await authRes.json();
    const token = authData.token;

    if (!token) {
      throw new Error('Failed to get Paymob auth token');
    }

    // 2. Register Paymob Order
    const amountCents = Math.round(Number(order.price) * 100);
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: order.order_code || order.id
      })
    });
    const orderData = await orderRes.json();
    const paymobOrderId = orderData.id;

    if (!paymobOrderId) {
      throw new Error('Failed to register order with Paymob');
    }

    // 3. Request Payment Key Token
    const nameParts = order.customer_name.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'FandomFit';

    const keyRes = await fetch('https://accept.paymob.com/api/ecommerce/payment-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: {
          first_name: firstName,
          last_name: lastName,
          email: order.customer_email || 'customer@fandomfit.com',
          phone_number: order.customer_phone,
          apartment: 'NA',
          floor: 'NA',
          street: order.location || 'Cairo',
          building: 'NA',
          shipping_method: 'PKG',
          postal_code: 'NA',
          city: order.city || 'Cairo',
          country: 'EG',
          state: order.governorate || 'Cairo'
        },
        currency: 'EGP',
        integration_id: Number(integrationId),
        lock_order_when_paid: true
      })
    });
    const keyData = await keyRes.json();
    const paymentKey = keyData.token;

    if (!paymentKey) {
      throw new Error('Failed to get Paymob payment key');
    }

    // Return redirect URL (iframe accepted by Paymob Accept)
    const iframeId = paymentSettings.paymob_public_key || 'card_iframe_placeholder'; 
    const redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
    
    return NextResponse.json({ success: true, redirectUrl });

  } catch (error: any) {
    console.error('Paymob initiation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
