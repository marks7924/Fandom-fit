import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { code, phone, orderAmount } = await request.json();
    if (!code) {
      return NextResponse.json({ isValid: false, error: 'invalid' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    
    // Fallback if keys are placeholders
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ isValid: false, error: 'mock_mode' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: offer, error } = await supabase
      .from('offers')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (error || !offer) {
      return NextResponse.json({ isValid: false, error: 'invalid' });
    }

    if (!offer.is_active) {
      return NextResponse.json({ isValid: false, error: 'inactive' });
    }

    // Bound phone check
    if (offer.bound_phone) {
      const cleanPhone = phone?.trim();
      if (!cleanPhone || cleanPhone !== offer.bound_phone.trim()) {
        return NextResponse.json({ isValid: false, error: 'phone_mismatch' });
      }
    }

    // Expiry Check
    if (offer.expires_at) {
      if (new Date(offer.expires_at).getTime() < Date.now()) {
        return NextResponse.json({ isValid: false, error: 'expired' });
      }
    }

    // Min Order amount check
    const minAmount = Number(offer.min_order_amount ?? 0);
    if (Number(orderAmount) < minAmount) {
      return NextResponse.json({ isValid: false, error: 'min_order_not_met' });
    }

    // Max uses overall check
    if (offer.max_uses !== null && offer.max_uses !== undefined && offer.max_uses > 0) {
      const { count, error: countErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .ilike('coupon_code', offer.code);

      if (!countErr && count !== null && count >= offer.max_uses) {
        return NextResponse.json({ isValid: false, error: 'limit_reached' });
      }
    }

    // Max uses per user check
    if (offer.max_uses_per_user !== null && offer.max_uses_per_user !== undefined && offer.max_uses_per_user > 0) {
      const cleanPhone = phone?.trim();
      if (cleanPhone) {
        const { count, error: userCountErr } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_phone', cleanPhone)
          .ilike('coupon_code', offer.code);

        if (!userCountErr && count !== null && count >= offer.max_uses_per_user) {
          return NextResponse.json({ isValid: false, error: 'user_limit_reached' });
        }
      }
    }

    return NextResponse.json({
      isValid: true,
      discountPercent: offer.discount_percent,
      discountType: offer.discount_type || 'percentage',
      discountValue: offer.discount_value || 0
    });

  } catch (error: any) {
    console.error('Coupon validation api error:', error);
    return NextResponse.json({ isValid: false, error: 'server_error' }, { status: 500 });
  }
}
