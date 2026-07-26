import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { orderId, receiptUrl } = await request.json();
    if (!orderId || !receiptUrl) {
      return NextResponse.json({ success: false, error: 'Order ID and Receipt URL are required' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    if (isMock) {
      // Return mock success
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 1. Fetch current order status
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'rejected') {
      return NextResponse.json({ success: false, error: 'Only rejected orders can have receipt resubmitted' }, { status: 400 });
    }

    // 2. Update order status and receipt url
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'pending_verification',
        payment_receipt_url: receiptUrl,
        rejection_reason: null
      })
      .eq('id', orderId);

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resubmitting receipt:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
