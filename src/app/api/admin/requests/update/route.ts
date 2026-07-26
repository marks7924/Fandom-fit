import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { id, status, notes, price } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Request ID and status are required' }, { status: 400 });
    }

    const isMock = !supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder');
    let supabaseClient: any;
    
    if (isMock) {
      // Handle simulated response
      return NextResponse.json({ success: true });
    } else {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    }

    // 1. Fetch current custom request details to send email
    const { data: reqData, error: fetchErr } = await supabaseClient
      .from('custom_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !reqData) {
      return NextResponse.json({ success: false, error: 'Custom request not found' }, { status: 404 });
    }

    // 2. Perform database update
    const updatePayload: Record<string, any> = { status, notes };
    if (price !== undefined && price !== null) {
      updatePayload.price = Number(price);
    }

    const { error: updateErr } = await supabaseClient
      .from('custom_requests')
      .update(updatePayload)
      .eq('id', id);

    if (updateErr) {
      throw updateErr;
    }

    // 3. If accepted, send email via SendGrid
    if (status === 'accepted') {
      let recipientEmail = reqData.email || '';
      if (!recipientEmail && reqData.user_id) {
        try {
          const { data: prof } = await supabaseClient
            .from('profiles')
            .select('email')
            .eq('id', reqData.user_id)
            .maybeSingle();
          if (prof?.email) {
            recipientEmail = prof.email;
          }
        } catch (e) {
          console.error('Error fetching profile email fallback:', e);
        }
      }

      const customerName = reqData.customer_name || 'Valued Customer';
      const description = reqData.description || '';
      const finalPrice = price !== undefined ? price : (reqData.price || 0);

      if (recipientEmail) {
        const sendgridApiKey = process.env.SENDGRID_API_KEY;
        const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
        
        // Retrieve hostname context or default to production url
        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const host = request.headers.get('host') || 'fandom-fit.vercel.app';
        const websiteUrl = `${protocol}://${host}`;

        if (sendgridApiKey && sendgridFromEmail) {
          try {
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
                subject: 'Your Custom Design Request Has Been Accepted! 🎉',
                content: [
                  {
                    type: 'text/html',
                    value: `
                      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
                        <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
                        <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">🎨 Design Lab Update</span>
                        
                        <p style="font-size: 14px; font-weight: bold; color: #000; line-height: 1.6;">Dear <strong>${customerName}</strong>,</p>
                        <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6;">Great news! Our custom design team has reviewed and accepted your design idea request!</p>
                        
                        <div style="background-color: #EDE0D0; border: 2px solid #000; border-radius: 12px; padding: 15px; margin: 20px 0; font-family: monospace;">
                          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Design Description:</p>
                          <p style="margin: 4px 0 12px 0; font-size: 12px; font-weight: bold; color: #000; white-space: pre-wrap;">${description}</p>
                          
                          <p style="margin: 0; font-size: 10px; font-weight: 900; color: rgba(0,0,0,0.5); text-transform: uppercase;">Accepted Price:</p>
                          <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 900; color: #E07A5F;">${finalPrice} EGP</p>
                        </div>
                        
                        <p style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; margin-bottom: 25px;">To choose your garment sizes, fabric type, quantity, and complete your order payment, please log into your account and complete checkout from your profile page:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${websiteUrl}/account" style="background-color: #E07A5F; color: #fff; text-decoration: none; padding: 14px 28px; border: 2px solid #000; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; box-shadow: 4px 4px 0px #000; display: inline-block;">Open My Profile ➔</a>
                        </div>
                        
                        <p style="font-size: 11px; font-weight: 600; color: #777; line-height: 1.5; border-top: 1px dashed rgba(0,0,0,0.15); padding-top: 15px; margin-top: 25px;">
                          * Note: You must sign in using the same email address (${recipientEmail}) you used to submit the custom design request.
                        </p>
                      </div>
                    `
                  }
                ]
              })
            });

            if (!sendgridRes.ok) {
              const errBody = await sendgridRes.text();
              console.error('SendGrid email delivery failed:', errBody);
            }
          } catch (emailErr) {
            console.error('Error sending SendGrid email:', emailErr);
          }
        } else {
          console.warn('SendGrid API Key or Sender Email is missing. Skipping email delivery.');
        }
      } else {
        console.warn('Custom request has no email address associated. Skipping email delivery.');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating custom request status:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
