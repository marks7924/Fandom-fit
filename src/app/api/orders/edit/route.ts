import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// These statuses block editing
const NON_EDITABLE_STATUSES = ['in_progress', 'completed', 'cancelled', 'shipped'];

const ALLOWED_UPDATE_FIELDS = [
  'customer_name',
  'customer_phone',
  'location',
  'governorate',
  'city',
  'address',
  'items',
  'price',
  'notes',
  'payment_receipt_url',
  'status'
];

const getFabricPremium = (fabric: string): number => {
  const f = (fabric || '').toLowerCase();
  if (f.includes('standard')) return 0;
  if (f.includes('oversized') || f.includes('over-sized')) return 150;
  if (f.includes('heavy')) return 100;
  if (f.includes('premium')) return 50;
  return 0; // default/fallback
};

export async function POST(request: Request) {
  try {
    const { orderId, cancelToken, userId, updates, items, payment_receipt_url } = await request.json();

    if (!orderId || !updates || typeof updates !== 'object') {
      return NextResponse.json({ success: false, error: 'Order ID and update fields are required' }, { status: 400 });
    }

    if (items) updates.items = items;
    if (payment_receipt_url) updates.payment_receipt_url = payment_receipt_url;

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

    // 4. If updates include items, recalculate total price & rebuild technical notes
    const finalUpdates = { ...updates };
    
    if (updates.items && Array.isArray(updates.items) && updates.items.length > 0) {
      // Calculate original subtotal of items
      const originalItems = Array.isArray(order.items) ? order.items : [];
      
      // We need to calculate the new price for each item based on its fabric/fit premium changes
      const updatedItems = updates.items.map((newItem: any) => {
        // Find matching original item to get base price
        const oldItem = originalItems.find((o: any) => o.id === newItem.id || o.product_id === newItem.product_id) || newItem;
        
        const oldPremium = getFabricPremium(oldItem.fabric);
        const newPremium = getFabricPremium(newItem.fabric);
        
        const basePrice = (oldItem.price || 0) - oldPremium;
        const newPrice = basePrice + newPremium;
        
        return {
          ...newItem,
          price: newPrice
        };
      });

      const oldSubtotal = originalItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      const newSubtotal = updatedItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
      
      const priceDiff = newSubtotal - oldSubtotal;
      const originalTotal = Number(order.price || 0);
      const newTotal = originalTotal + priceDiff;

      // Reconstruct technical notes to prevent user from writing random notes & protect COD info
      const customerNoteMatch = (order.notes || '').match(/Customer Note:\s*([^|]+)/i);
      const customerNote = customerNoteMatch ? customerNoteMatch[1].trim() : '';

      // Capture original items spec for admin diff display
      // Preserve any existing "Before Edit" snapshot (don't overwrite on multiple edits)
      const existingBeforeMatch = (order.notes || '').match(/\[Before Edit:\s*([^\]]+)\]/);
      const beforeSnap = existingBeforeMatch
        ? `[Before Edit: ${existingBeforeMatch[1]}]`
        : `[Before Edit: ${originalItems.map((i: any) => `${i.product_name}: ${i.size || ''}/${i.fabric}/${i.fit_type || 'oversized'} x${i.quantity || 1}`).join(', ')}]`;

      const specsStr = updatedItems.map((i: any) => `${i.product_name}: ${i.size || ''}/${i.fabric}/${i.fit_type || 'oversized'} x${i.quantity || 1}`).join(', ');
      
      let reconstructedNotes = `[Order Edited by Customer] | ${beforeSnap} | [Checkout Type: Web] | Items Spec: ${specsStr}`;
      if (customerNote) {
        reconstructedNotes += ` | Customer Note: ${customerNote}`;
      }

      // Check payment split details
      const isCod = (order.payment_method || '').startsWith('cod');
      const isCustomOrder = (order.product_name || '').toLowerCase().includes('custom design');
      const depositPercent = isCustomOrder ? 0.50 : 0.10;
      
      if (isCod) {
        // Recalculate deposit and balance
        const shippingFee = originalTotal - oldSubtotal;
        const newDeposit = Math.round((newSubtotal * depositPercent) + shippingFee);
        const newBalance = Math.max(0, newTotal - newDeposit);
        
        let splitNote = `[COD Deposit split: Paid ${depositPercent * 100}% items + shipping (${newDeposit} EGP) upfront. Balance due on delivery: ${newBalance} EGP.]`;
        if (priceDiff > 0) {
          const additionalDeposit = Math.round(priceDiff * depositPercent);
          splitNote = `[COD Deposit split: Paid ${depositPercent * 100}% items + shipping (${newDeposit} EGP) upfront. Balance due on delivery: ${newBalance} EGP. Edits: Added +${priceDiff} EGP total, +${additionalDeposit} EGP deposit due.]`;
        }
        reconstructedNotes = `${splitNote} | ${reconstructedNotes}`;
      } else {
        // Online payments
        if (priceDiff > 0) {
          reconstructedNotes = `[Edits: Price rose by +${priceDiff} EGP. Outstanding balance to be verified.] | ${reconstructedNotes}`;
        }
      }

      // Apply computed updates
      finalUpdates.items = updatedItems;
      finalUpdates.price = newTotal;
      finalUpdates.notes = reconstructedNotes;

      // If price rises and they paid the difference via screenshot (InstaPay), mark as pending_verification
      if (priceDiff > 0 && updates.payment_receipt_url) {
        finalUpdates.status = 'pending_verification';
      }
    }

    // 5. Sanitize updates — only allow permitted fields
    const safeUpdates: Record<string, any> = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in finalUpdates) {
        safeUpdates[key] = finalUpdates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields provided for update' }, { status: 400 });
    }

    // 5b. Always stamp [Order Edited by Customer] into the notes field,
    //     regardless of whether items changed or only address/name changed.
    const EDIT_STAMP = '[Order Edited by Customer]';
    const existingNotes = (safeUpdates.notes || order.notes || '');
    if (!existingNotes.includes(EDIT_STAMP)) {
      safeUpdates.notes = `${EDIT_STAMP} | ${existingNotes}`.replace(/ \| $/, '');
    } else {
      // Stamp is already there (items branch set it) — keep as-is
      if (!safeUpdates.notes) safeUpdates.notes = existingNotes;
    }

    // 6. Apply updates
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
