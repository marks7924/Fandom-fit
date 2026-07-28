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
        // Fetch settings override templates
        const { data: settingsList } = await supabaseClient
          .from('settings')
          .select('*');
        
        const settings: Record<string, any> = {};
        if (settingsList) {
          settingsList.forEach((s: any) => {
            settings[s.key] = s.value;
          });
        }

        const replacePlaceholders = (template: string) => {
          return template
            .replace(/{customerName}/g, order.customer_name || 'Valued Customer')
            .replace(/{orderCode}/g, order.order_code || order.id)
            .replace(/{price}/g, `${order.price} EGP`)
            .replace(/{location}/g, order.location || 'N/A')
            .replace(/{paymentMethod}/g, (order.payment_method || '').replace(/_/g, ' ').toUpperCase())
            .replace(/{rejectionReason}/g, rejectionReason || 'Invalid or unreadable screenshot.')
            .replace(/{problemCode}/g, problemCode)
            .replace(/{websiteUrl}/g, websiteUrl);
        };

        let subject = '';
        let htmlValue = '';

        // Handle 'in_progress' status with its own dedicated email
        if (status === 'in_progress') {
          const defaultInProgressSubject = `Your order is now being made! 🔨 (Code: ${order.order_code || order.id})`;
          const defaultInProgressHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
              <h2 style="color: #3D405B; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
              <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🔨 Order In Production</span>
              
              <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${order.customer_name || 'Valued Customer'}</strong>,</p>
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Great news! Your order is now <strong>in production</strong>. Our team has started crafting and printing your custom streetwear.</p>
              
              <div style="background-color: #3D405B; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; color: #EDE0D0; font-family: monospace;">
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(237,224,208,0.6); text-transform: uppercase;">Order Code:</p>
                <p style="margin: 4px 0 12px 0; font-size: 16px; font-weight: 900;">${order.order_code || order.id}</p>
                
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(237,224,208,0.6); text-transform: uppercase;">Total Amount:</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #F2CC8F;">${order.price} EGP</p>
              </div>
              
              <div style="background-color: #FFF8E7; border: 2px solid #F2CC8F; border-radius: 12px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; font-weight: 900; color: #7C6300;">⚠️ Important Notice:</p>
                <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: #7C6300; line-height: 1.6;">
                  Since your order is now <strong>in production</strong>, you can <strong>no longer cancel or edit it</strong>. If you have any urgent concerns, please contact us directly on Instagram: <a href="https://www.instagram.com/fandom.__.fit" style="color: #E07A5F; font-weight: bold;">@fandom.__.fit</a>
                </p>
              </div>
              
              <p style="font-size: 12px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">
                We will contact you via phone/WhatsApp when your package is ready for shipment. Estimated delivery: <strong>2–4 business days</strong> from today.
              </p>
              
              <p style="font-size: 10px; font-weight: 600; color: #999; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                Fandom Fit — Wear What You Love. Check your Spam/Junk folder if you miss our updates.
              </p>
            </div>
          `;
          
          const rawSubject = settings.email_template_inprogress_subject || defaultInProgressSubject;
          const rawHtml = settings.email_template_inprogress_body || defaultInProgressHtml;
          
          subject = replacePlaceholders(rawSubject);
          htmlValue = replacePlaceholders(rawHtml);
        } else if (status === 'paid' || status === 'completed') {
          const defaultApprovedSubject = 'Your payment was accepted! Work has started 🎉';
          const defaultApprovedHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
              <h2 style="color: #2A9D8F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
              <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🛡️ Payment Verified</span>
              
              <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>{customerName}</strong>,</p>
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Awesome news! Your InstaPay manual payment transfer receipt has been successfully verified by our accounting team.</p>
              
              <div style="background-color: #EDE0D0; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Order Reference Code:</p>
                <p style="margin: 4px 0 12px 0; font-size: 13px; font-weight: bold; color: #000;">{orderCode}</p>
                
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Amount Paid:</p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900; color: #2A9D8F;">{price}</p>
              </div>
              
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">
                Our production unit has begun crafting and printing your high-quality streetwear garments! We will notify you as soon as your package ships.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{websiteUrl}/account" style="background-color: #2A9D8F; color: #fff; text-decoration: none; padding: 14px 28px; border: 2px solid #000; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; box-shadow: 4px 4px 0px #000; display: inline-block;">Track My Order ➔</a>
              </div>
              
              <p style="font-size: 10px; font-weight: 600; color: #999; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                * Notice: If you do not see our emails in your Primary Inbox, please check your <strong>Spam or Junk folder</strong> and mark Fandom Fit as a safe sender.
              </p>
            </div>
          `;
          
          const rawSubject = settings.email_template_approved_subject || defaultApprovedSubject;
          const rawHtml = settings.email_template_approved_body || defaultApprovedHtml;
          
          subject = replacePlaceholders(rawSubject);
          htmlValue = replacePlaceholders(rawHtml);
        } else if (status === 'rejected' || status === 'payment_failed') {
          const defaultRejectedSubject = 'Action Required: Payment Verification Failed ⚠️';
          const defaultRejectedHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
              <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
              <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">⚠️ Payment Rejected</span>
              
              <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>{customerName}</strong>,</p>
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">We were unable to verify your manual payment transfer receipt for order reference: <strong>{orderCode}</strong>.</p>
              
              <div style="background-color: #FDF2F0; border: 2px solid #E07A5F; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: #E07A5F; text-transform: uppercase;">Reason for Rejection:</p>
                <p style="margin: 4px 0 12px 0; font-size: 12px; font-weight: bold; color: #000;">{rejectionReason}</p>
                
                <p style="margin: 0; font-size: 10px; font-weight: 900; color: #E07A5F; text-transform: uppercase;">Instagram Problem Code:</p>
                <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #E07A5F; letter-spacing: 1px;">{problemCode}</p>
              </div>
              
              <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">
                <strong>What should I do?</strong><br>
                Please contact our support team immediately on Instagram at <a href="https://www.instagram.com/fandom.__.fit" style="color: #E07A5F; font-weight: bold; text-decoration: underline;">@fandom.__.fit</a>. Provide our team with your order details and quote the <strong>Problem Code: {problemCode}</strong> so we can locate your record and verify your transfer manually.
              </p>
              
              <p style="font-size: 10px; font-weight: bold; color: #777; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                * Crucial: Under store policies, refused order codes and tickets are held in buffer and automatically deleted after <strong>14 days</strong> from submission. Please reach out to us on Instagram promptly. Check your <strong>Spam/Junk folder</strong> if you do not receive our notifications.
              </p>
            </div>
          `;
          
          const rawSubject = settings.email_template_rejected_subject || defaultRejectedSubject;
          const rawHtml = settings.email_template_rejected_body || defaultRejectedHtml;
          
          subject = replacePlaceholders(rawSubject);
          htmlValue = replacePlaceholders(rawHtml);
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
