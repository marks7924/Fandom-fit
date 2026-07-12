import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    // Fallback if keys are placeholders
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: false, error: 'mock_mode' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'completed') {
      return NextResponse.json({ success: true, rewardCouponCode: order.reward_coupon_code });
    }

    // 2. Set order status to completed
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 });
    }

    let rewardCouponCode = '';

    // 3. Cotton Collection Reward check
    // Cotton Collection: Category/Product/Material names containing "cotton"
    const hasCottonItem = 
      order.product_name.toLowerCase().includes('cotton') || 
      (order.notes && order.notes.toLowerCase().includes('cotton')) ||
      (order.items && Array.isArray(order.items) && order.items.some((item: any) => 
        item.product_name.toLowerCase().includes('cotton') || 
        (item.fabric && item.fabric.toLowerCase().includes('cotton'))
      ));

    if (hasCottonItem) {
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      rewardCouponCode = `COTTON-${randomString}`;
      
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const newOffer = {
        title_en: 'Cotton Collection Reward (25% OFF)',
        title_ar: 'مكافأة مجموعة القطن (خصم ٢٥٪)',
        description_en: 'Thank you for purchasing from the Cotton Collection. Get 25% off one future order!',
        description_ar: 'شكرًا لشرائك من مجموعة القطن. احصل على خصم ٢٥٪ على طلبك القادم!',
        discount_text_en: '25% OFF',
        discount_text_ar: 'خصم ٢٥٪',
        code: rewardCouponCode,
        discount_percent: 25,
        max_uses: 1,
        max_uses_per_user: 1,
        is_active: true,
        show_on_homepage: false,
        discount_type: 'percentage',
        discount_value: 25,
        coupon_type: 'cotton_reward',
        is_one_time: true,
        is_public: false,
        expires_at: expiryDate.toISOString(),
      };

      await supabase.from('offers').insert([newOffer]);
    }

    // 4. Referral Code check
    if (order.referral_code) {
      const cleanRefCode = order.referral_code.trim().toUpperCase();

      // Prevent duplicate rewards: check completed orders for same customer phone + referral code
      const { count, error: countErr } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('customer_phone', order.customer_phone)
        .ilike('referral_code', cleanRefCode);

      // Current order is already completed, so count should be exactly 1
      if (!countErr && count !== null && count <= 1) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const thankYouCode = `THANKS-${randomString}`;

        if (!rewardCouponCode) {
          rewardCouponCode = thankYouCode;
        } else {
          rewardCouponCode += `, ${thankYouCode}`;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const newOffer = {
          title_en: 'Referral Reward (15% OFF)',
          title_ar: 'مكافأة ترشيح (خصم ١٥٪)',
          description_en: 'Thank you for referring a friend! Enjoy 15% off your next purchase.',
          description_ar: 'شكرًا لترشيح صديق! استمتع بخصم ١٥٪ على طلبك القادم.',
          discount_text_en: '15% OFF',
          discount_text_ar: 'خصم ١٥٪',
          code: thankYouCode,
          discount_percent: 15,
          max_uses: 1,
          max_uses_per_user: 1,
          is_active: true,
          show_on_homepage: false,
          discount_type: 'percentage',
          discount_value: 15,
          coupon_type: 'referral_reward_thank_you',
          is_one_time: true,
          is_public: false,
          expires_at: expiryDate.toISOString(),
        };

        await supabase.from('offers').insert([newOffer]);
      }
    }

    // 5. Update order details with generated reward coupon codes
    if (rewardCouponCode) {
      await supabase
        .from('orders')
        .update({ reward_coupon_code: rewardCouponCode })
        .eq('id', orderId);
    }

    return NextResponse.json({ success: true, rewardCouponCode });

  } catch (error: any) {
    console.error('Order completion API error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
