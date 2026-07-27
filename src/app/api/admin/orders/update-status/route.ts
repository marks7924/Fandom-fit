import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { orderId, status, rejectionReason } = await request.json();
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    let supabaseClient: any;

    if (isMock) {
      return NextResponse.json({ success: true });
    } else {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    }

    // 1. Fetch current order details to send email
    const { data: order, error: fetchErr } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    let finalRejectionReason = rejectionReason || null;
    let problemCode = '';

    // 2. If status is rejected/failed, generate a Problem Code
    if (status === 'rejected' || status === 'payment_failed') {
      const randLetters = Math.random().toString(36).substring(2, 8).toUpperCase();
      problemCode = `ERR-${randLetters}`;
      
      const adminReason = rejectionReason || 'Invalid payment receipt screenshot';
      finalRejectionReason = `[Problem Code: ${problemCode}] Rejection note: ${adminReason}`;
    }

    // 3. Perform database status update
    const { error: updateErr } = await supabaseClient
      .from('orders')
      .update({
        status,
        rejection_reason: finalRejectionReason
      })
      .eq('id', orderId);

    if (updateErr) {
      throw updateErr;
    }

    // 4. Send emails via SendGrid
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
    const recipientEmail = order.customer_email || '';

    // Retrieve hostname context or default to production url
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'fandom-fit.vercel.app';
    const websiteUrl = `${protocol}://${host}`;

    if (recipientEmail && sendgridApiKey && sendgridFromEmail) {
      try {
        let subject = '';
        let htmlValue = '';

        if (status === 'paid' || status === 'completed' || status === 'in_progress') {
          subject = 'Your payment was accepted! Work has started 🎉';
          htmlValue = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
              <h2 style="color: #2A9D8F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
              <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🛡️ Payment Verified</span>
              
              <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${order.customer_name}</strong>,</p>
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Awesome news! Your InstaPay manual payment transfer receipt has been successfully verified by our accounting team.</p>
              
              <div style="background-color: #EDE0D0; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Order Reference Code:</p>
                <p style="margin: 4px 0 12px 0; font-size: 13px; font-weight: bold; color: #000;">${order.order_code || order.id}</p>
                
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Amount Paid:</p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900; color: #2A9D8F;">${order.price} EGP</p>
              </div>
              
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">
                Our production unit has begun crafting and printing your high-quality streetwear garments! We will notify you as soon as your package ships.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}/account" style="background-color: #2A9D8F; color: #fff; text-decoration: none; padding: 14px 28px; border: 2px solid #000; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; box-shadow: 4px 4px 0px #000; display: inline-block;">Track My Order ➔</a>
              </div>
              
              <p style="font-size: 10px; font-weight: 600; color: #999; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                * Notice: If you do not see our emails in your Primary Inbox, please check your <strong>Spam or Junk folder</strong> and mark Fandom Fit as a safe sender.
              </p>
            </div>
          `;
        } else if (status === 'rejected' || status === 'payment_failed') {
          subject = 'Action Required: Payment Verification Failed ⚠️';
          htmlValue = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
              <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
              <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">⚠️ Payment Rejected</span>
              
              <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${order.customer_name}</strong>,</p>
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">We were unable to verify your manual payment transfer receipt for order reference: <strong>${order.order_code || order.id}</strong>.</p>
              
              <div style="background-color: #FDF2F0; border: 2px solid #E07A5F; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: #E07A5F; text-transform: uppercase;">Reason for Rejection:</p>
                <p style="margin: 4px 0 12px 0; font-size: 12px; font-weight: bold; color: #000;">${rejectionReason || 'Invalid or unreadable transaction screenshot upload.'}</p>
                
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: #E07A5F; text-transform: uppercase;">Instagram Problem Code:</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #E07A5F; letter-spacing: 1px;">${problemCode}</p>
              </div>
              
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">
                <strong>What should I do?</strong><br>
                Please contact our support team immediately on Instagram at <a href="https://www.instagram.com/fandom.__.fit" style="color: #E07A5F; font-weight: bold; text-decoration: underline;">@fandom.__.fit</a>. Provide our team with your order details and quote the <strong>Problem Code: ${problemCode}</strong> so we can locate your record and verify your transfer manually.
              </p>
              
              <p style="font-size: 10px; font-weight: bold; color: #777; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                * Crucial: Under store policies, refused order codes and tickets are held in buffer and automatically deleted after <strong>14 days</strong> from submission. Please reach out to us on Instagram promptly. Check your <strong>Spam/Junk folder</strong> if you do not receive our notifications.
              </p>
            </div>
          `;
        }

        if (subject && htmlValue) {
          const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sendgridApiKey}`
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: recipientEmail }] }],
              from: { email: sendgridFromEmail, name: 'Fandom Fit' },
              subject,
              content: [{ type: 'text/html', value: htmlValue }]
            })
          });

          if (!sendgridRes.ok) {
            const errBody = await sendgridRes.text();
            console.error('SendGrid email delivery failed:', errBody);
          }
        }
      } catch (e) {
        console.error('Error dispatching SendGrid email:', e);
      }
    }

    // 5. Automated 14-day cleanup for expired problem codes
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const { error: cleanupErr } = await supabaseClient
        .from('orders')
        .delete()
        .lt('created_at', fourteenDaysAgo.toISOString())
        .like('rejection_reason', '%[Problem Code:%');

      if (cleanupErr) {
        console.error('Error running 14-day database cleanup:', cleanupErr);
      }
    } catch (cleanupErr) {
      console.error('Error in cleanup block:', cleanupErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in update status endpoint:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
