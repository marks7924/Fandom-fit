import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const NON_CANCELLABLE_STATUSES = ['in_progress', 'completed', 'cancelled', 'shipped'];

export async function POST(request: Request) {
  try {
    const { orderId, cancelToken, userId, reason } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
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
      return NextResponse.json({ success: false, error: 'Unauthorized: Cannot cancel this order' }, { status: 403 });
    }

    // 3. Check if the order can be cancelled
    if (NON_CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json({
        success: false,
        error: `Order cannot be cancelled because its status is "${order.status}". Contact support if needed.`
      }, { status: 422 });
    }

    // 4. Mark order as cancelled (safely fallback if cancel_reason column doesn't exist yet)
    const updatePayload: Record<string, any> = { 
      status: 'cancelled', 
      rejection_reason: reason || 'Cancelled by customer',
      cancel_reason: reason || 'Cancelled by customer'
    };
    
    let { error: updateErr } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updateErr) {
      console.warn('Failed to update with cancel_reason (probably column missing), falling back:', updateErr.message);
      // Fallback: exclude cancel_reason
      const fallbackPayload = { 
        status: 'cancelled', 
        rejection_reason: reason || 'Cancelled by customer'
      };
      const { error: fallbackErr } = await supabase
        .from('orders')
        .update(fallbackPayload)
        .eq('id', orderId);
      if (fallbackErr) throw fallbackErr;
    }

    // 5. Send admin notification email
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
    const adminEmails = (process.env.ADMIN_NOTIFICATION_EMAILS || '').split(',').map((e: string) => e.trim()).filter(Boolean);

    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'fandom-fit.vercel.app';
    const websiteUrl = `${protocol}://${host}`;

    if (sendgridApiKey && sendgridFromEmail && adminEmails.length > 0) {
      try {
        const adminHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9;">
            <h2 style="color: #E07A5F; font-size: 22px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit Admin</h2>
            <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🚫 Order Cancelled by Customer</span>

            <div style="background-color: #FDF2F0; border: 2px solid #E07A5F; border-radius: 12px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 900; color: #E07A5F; text-transform: uppercase;">Order Details:</p>
              <p style="margin: 2px 0; font-size: 13px; font-weight: bold;">Order Code: <strong>${order.order_code || order.id.substring(0, 8).toUpperCase()}</strong></p>
              <p style="margin: 2px 0; font-size: 12px;">Customer: ${order.customer_name}</p>
              <p style="margin: 2px 0; font-size: 12px;">Phone: ${order.customer_phone || 'N/A'}</p>
              <p style="margin: 2px 0; font-size: 12px;">Total: ${order.price} EGP</p>
              <p style="margin: 2px 0; font-size: 12px;">Payment: ${(order.payment_method || 'N/A').replace(/_/g, ' ').toUpperCase()}</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #777;">Cancelled on: ${new Date().toLocaleString()}</p>
            </div>

            <p style="font-size: 12px; font-weight: 600; color: #333; line-height: 1.6;">
              The customer has voluntarily cancelled this order. 
            </p>
            <div style="background-color: #f5f5f5; border-left: 4px solid #E07A5F; padding: 10px; margin: 10px 0; font-size: 12px; font-style: italic;">
              <strong>Cancellation Reason:</strong> ${reason || 'Not specified'}
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${websiteUrl}/admin" style="background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border: 2px solid #000; border-radius: 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; display: inline-block;">
                Go to Admin Panel ➔
              </a>
            </div>
          </div>
        `;

        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sendgridApiKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: adminEmails.map((email: string) => ({ email })) }],
            from: { email: sendgridFromEmail, name: 'Fandom Fit System' },
            subject: `🚫 Order Cancelled: ${order.order_code || order.id.substring(0, 8).toUpperCase()} — Customer: ${order.customer_name}`,
            content: [{ type: 'text/html', value: adminHtml }]
          })
        });
      } catch (emailErr) {
        console.error('Admin cancel notification email failed:', emailErr);
      }
    }

    // 6. Send confirmation email to the customer
    const recipientEmail = order.customer_email || '';
    if (sendgridApiKey && sendgridFromEmail && recipientEmail) {
      try {
        const customerHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
            <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
            <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🚫 Order Cancellation Confirmed</span>

            <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${order.customer_name}</strong>,</p>
            <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Your order has been successfully cancelled as requested.</p>

            <div style="background-color: #EDE0D0; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
              <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Cancelled Order Code:</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 900; color: #E07A5F;">${order.order_code || order.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <p style="font-size: 12px; font-weight: 600; color: #333; line-height: 1.6;">
              If a deposit was paid via InstaPay or card, refunds are processed within <strong>3–5 business days</strong>. Please contact us via Instagram if you have any questions.
            </p>

            <p style="font-size: 10px; font-weight: 600; color: #999; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
              Fandom Fit — Wear What You Love. If this wasn't you, please contact us immediately on Instagram: <strong>@fandom.__.fit</strong>
            </p>
          </div>
        `;

        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sendgridApiKey}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: recipientEmail }] }],
            from: { email: sendgridFromEmail, name: 'Fandom Fit' },
            subject: `Order Cancellation Confirmed — ${order.order_code || order.id.substring(0, 8).toUpperCase()}`,
            content: [{ type: 'text/html', value: customerHtml }]
          })
        });
      } catch (emailErr) {
        console.error('Customer cancellation confirmation email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in order cancel endpoint:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
