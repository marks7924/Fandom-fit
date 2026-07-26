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

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    if (isMock) {
      return NextResponse.json({ success: true });
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

    const recipientEmail = order.customer_email || '';
    if (!recipientEmail) {
      return NextResponse.json({ success: true, message: 'No email address on order' });
    }

    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!sendgridApiKey || !sendgridFromEmail) {
      console.warn('SendGrid credentials missing. Skipping email receipt.');
      return NextResponse.json({ success: false, error: 'SendGrid credentials missing' }, { status: 500 });
    }

    const customerName = order.customer_name || 'Valued Customer';
    const orderCode = order.order_code || 'N/A';
    const price = order.price || 0;
    const location = order.location || 'N/A';
    const notes = order.notes || '';
    const paymentMethod = order.payment_method || 'N/A';

    // Format items list if available
    let itemsHtml = '';
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      itemsHtml = order.items.map((item: any) => `
        <div style="padding: 10px 0; border-bottom: 1px dashed rgba(0,0,0,0.1); display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #000;">
          <div>
            ${item.product_name || item.name || 'Fandom Fit Apparel'}
            <span style="font-size: 10px; color: #666; display: block; margin-top: 2px;">
              Size: ${item.size || 'M'} | Fabric: ${item.fabric || 'Standard Cotton'} | Qty: ${item.quantity || 1}
            </span>
          </div>
          <div style="font-family: monospace;">${item.price ? `${item.price * (item.quantity || 1)} EGP` : ''}</div>
        </div>
      `).join('');
    } else {
      itemsHtml = `
        <div style="padding: 10px 0; border-bottom: 1px dashed rgba(0,0,0,0.1); font-size: 12px; font-weight: bold; color: #000;">
          ${order.product_name || 'Fandom Fit Wear'}
        </div>
      `;
    }

    // Determine estimated arrival time (standard streetwear delivery in Egypt)
    const arrivalTime = '2-4 Business Days';

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
        <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
        <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">📦 Order Confirmation Receipt</span>
        
        <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
        <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Thank you for shopping with us! We have received your order and are preparing it for delivery. Here are your order details:</p>
        
        <div style="background-color: #EDE0D0; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Order Code:</p>
          <p style="margin: 4px 0 12px 0; font-size: 14px; font-weight: 900; color: #000;">${orderCode}</p>
          
          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Estimated Delivery Time:</p>
          <p style="margin: 4px 0 12px 0; font-size: 14px; font-weight: 950; color: #E07A5F;">${arrivalTime}</p>

          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Delivery Address:</p>
          <p style="margin: 4px 0 12px 0; font-size: 11px; font-weight: bold; color: #333;">${location}</p>
          
          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Payment Method:</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold; color: #333; text-transform: uppercase;">${paymentMethod.replace(/_/g, ' ')}</p>
        </div>

        <h4 style="font-size: 12px; font-weight: 900; uppercase; margin-bottom: 10px; color: #000;">Items Ordered:</h4>
        <div style="border: 2px solid #000; border-radius: 12px; background-color: #fff; padding: 15px; margin-bottom: 25px;">
          ${itemsHtml}
          <div style="padding-top: 15px; margin-top: 5px; display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; color: #E07A5F;">
            <span>Total Paid/Due:</span>
            <span style="font-family: monospace;">${price} EGP</span>
          </div>
        </div>
        
        <p style="font-size: 12px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">We will contact you via phone/WhatsApp when the package is out for delivery.</p>
        
        <div style="font-size: 11px; font-weight: 600; color: #E07A5F; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px; text-align: center;">
          💡 Note: If you do not see this email in your inbox, please make sure to check your <strong>Spam or Junk folder</strong> and mark Fandom Fit as a safe sender.
        </div>
      </div>
    `;

    const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sendgridApiKey}`
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail }]
          }
        ],
        from: {
          email: sendgridFromEmail,
          name: 'Fandom Fit'
        },
        subject: `Your Fandom Fit Order Confirmation! 📦 (Code: ${orderCode})`,
        content: [
          {
            type: 'text/html',
            value: emailHtml
          }
        ]
      })
    });

    if (!sendgridRes.ok) {
      const errBody = await sendgridRes.text();
      console.error('SendGrid email delivery failed:', errBody);
      return NextResponse.json({ success: false, error: 'SendGrid failed to deliver receipt' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending order receipt email:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
