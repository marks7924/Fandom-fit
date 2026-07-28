import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// These statuses block editing
const NON_EDITABLE_STATUSES = ['in_progress', 'completed', 'cancelled', 'shipped'];

// Only these fields are safe to update by users
const ALLOWED_UPDATE_FIELDS = [
  'customer_name',
  'customer_phone',
  'location',
  'notes',
  'governorate',
  'city',
  'address'
];

export async function POST(request: Request) {
  try {
    const { orderId, cancelToken, userId, updates } = await request.json();

    if (!orderId || !updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'Order ID and update fields are required' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    if (isMock) {
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch the order to validate
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Verify ownership via cancel token OR user_id
    const tokenMatch = cancelToken && order.cancel_token && order.cancel_token === cancelToken;
    const userMatch = userId && order.user_id && order.user_id === userId;

    if (!tokenMatch && !userMatch) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Cannot edit this order' }, { status: 403 });
    }

    // 3. Check if the order can be edited
    if (NON_EDITABLE_STATUSES.includes(order.status)) {
      return NextResponse.json({
        success: false,
        error: `Order cannot be edited because its status is "${order.status}".`
      }, { status: 422 });
    }

    // 4. Sanitize updates — only allow permitted fields
    const safeUpdates: Record<string, any> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in updates) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided for update' }, { status: 400 });
    }

    // 5. Apply updates
    const { error: updateErr } = await supabase
      .from('orders')
      .update(safeUpdates)
      .eq('id', orderId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, updated: safeUpdates });
  } catch (error: any) {
    console.error('Error in order edit endpoint:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
