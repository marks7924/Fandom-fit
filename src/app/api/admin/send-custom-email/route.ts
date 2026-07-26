import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, subject, message } = await request.json();
    if (!email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Email, subject, and message are required' }, { status: 400 });
    }

    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!sendgridApiKey || !sendgridFromEmail) {
      console.warn('SendGrid credentials missing. Cannot dispatch custom email.');
      return NextResponse.json({ success: false, error: 'SendGrid API Key or Sender Email is missing on server configuration' }, { status: 500 });
    }

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 2px solid #000; border-radius: 16px; background-color: #FFFDF9; box-shadow: 6px 6px 0px #000;">
        <h2 style="color: #E07A5F; font-size: 24px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Fandom Fit</h2>
        <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; tracking-wider: 2px; display: block; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">✉️ Support & Updates Update</span>
        
        <div style="font-size: 13px; font-weight: 600; color: #333; line-height: 1.6; white-space: pre-wrap; margin-bottom: 30px;">${message}</div>
        
        <p style="font-size: 12px; font-weight: 600; color: #333; line-height: 1.6;">If you have any questions, you can contact us via our website Live Chat or reply directly to this email.</p>
        
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
            to: [{ email: email }]
          }
        ],
        from: {
          email: sendgridFromEmail,
          name: 'Fandom Fit Support'
        },
        subject: subject,
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
      console.error('SendGrid custom email dispatch failed:', errBody);
      return NextResponse.json({ success: false, error: 'SendGrid failed to send email: ' + errBody }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error dispatching custom admin email:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}
