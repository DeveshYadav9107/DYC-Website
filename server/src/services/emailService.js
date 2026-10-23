import nodemailer from 'nodemailer';
import dns from 'dns';
import env from '../config/env.js';
import ApiError from '../utils/apiError.js';

// Force IPv4 over IPv6 on Linux cloud containers like Render (prevents ENETUNREACH)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || 'smtp.gmail.com',
    port: env.EMAIL_PORT || 587,
    secure: env.EMAIL_SECURE,
    family: 4, // Strict IPv4 (never attempt IPv6 which fails on Render)
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

/**
 * Send OTP verification email
 * Supports:
 *  1. Resend REST API (HTTPS port 443 - Works on Render Free Tier)
 *  2. Brevo REST API (HTTPS port 443 - Works on Render Free Tier)
 *  3. Nodemailer SMTP (standard TLS port 587)
 *  4. Cloud console log fallback (Never blocks users if cloud host firewall blocks SMTP)
 */
export const sendOtpEmail = async ({ to, otp, purpose, firstName = '' }) => {
  // Safe diagnostic log without logging secrets or plaintext OTP
  console.log(`📧 [Email Dispatch] Purpose: ${purpose.toUpperCase()}`);

  let subject = '';
  let heading = '';
  let subtext = '';
  let actionDescription = '';

  if (purpose === 'signup') {
    subject = `${otp} is your DY&C verification code`;
    heading = 'Verify Your Email Address';
    subtext = 'Thank you for registering with Dinesh Yadav & Company.';
    actionDescription = 'Please use the verification code below to verify your email and activate your account.';
  } else if (purpose === 'login') {
    subject = `${otp} is your DY&C login verification code`;
    heading = 'Login Verification Code';
    subtext = 'A sign-in request was received for your DY&C account.';
    actionDescription = 'Please enter this one-time code to securely complete your login.';
  } else if (purpose === 'password-reset') {
    subject = `${otp} is your DY&C password reset code`;
    heading = 'Reset Your Password';
    subtext = 'We received a request to reset your DY&C account password.';
    actionDescription = 'Use the code below to verify your identity and set a new password.';
  } else {
    subject = `${otp} is your DY&C verification code`;
    heading = 'Verification Code';
    subtext = 'Your one-time code from Dinesh Yadav & Company.';
    actionDescription = 'Please use the verification code below to proceed.';
  }

  const nameGreeting = firstName ? `Hello ${firstName},` : 'Hello,';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #11183F; padding: 28px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      <span style="color: #10B981;">DY</span>&C
                    </span>
                    <span style="display: block; font-size: 11px; font-weight: 600; color: #94A3B8; letter-spacing: 1.5px; margin-top: 4px; text-transform: uppercase;">
                      SAP • ERP • Staffing Solutions
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.3;">
                ${heading}
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                ${nameGreeting} ${subtext}
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                ${actionDescription}
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #EEF2FF; border: 1.5px dashed #4F46E5; border-radius: 12px; padding: 20px 24px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4F46E5; letter-spacing: 1.5px; margin-bottom: 8px;">
                      Your One-Time Password
                    </div>
                    <div style="font-size: 36px; font-weight: 800; color: #11183F; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                      ${otp}
                    </div>
                    <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
                      ⏱ Expires in <strong>5 minutes</strong> • Single use only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Advice -->
              <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; border-radius: 6px; padding: 12px 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 12.5px; color: #92400E; line-height: 1.5;">
                  <strong>Security Note:</strong> Do not share this code with anyone. Dinesh Yadav & Company employees will never ask for your verification code.
                </p>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                If you did not make this request, you can safely ignore this email. Someone may have entered your email address by mistake.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                © ${new Date().getFullYear()} Dinesh Yadav & Company (DY&C). All rights reserved.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94A3B8;">
                Enterprise Consulting • SAP Implementation & AMS • Staffing
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Dinesh Yadav & Company (DY&C) - ${heading}

${nameGreeting}
${subtext}
${actionDescription}

YOUR VERIFICATION CODE: ${otp}

This code is valid for 5 minutes and can only be used once.

Security Notice: Never share this code with anyone. Dinesh Yadav & Company employees will never ask you for this code.
If you did not request this, please ignore this email.

© ${new Date().getFullYear()} Dinesh Yadav & Company. All rights reserved.
  `.trim();

  // 1. Try Resend HTTP REST API if RESEND_API_KEY is configured (HTTPS port 443 - Never blocked on Render)
  if (env.RESEND_API_KEY) {
    const resendFrom = (env.RESEND_FROM && !env.RESEND_FROM.includes('@gmail.com'))
      ? env.RESEND_FROM
      : 'DY&C <onboarding@resend.dev>';

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [to],
          subject,
          html,
          text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('❌ Resend API returned error:', data);
        throw new ApiError(
          res.status || 400,
          `Email delivery failed: ${data.message || 'Resend API rejected the request. Make sure you are sending to your Resend account email or verify your domain in Resend.'}`
        );
      }

      console.log(`✉️ [Resend API] OTP sent successfully to ${to}. MessageId: ${data.id}`);
      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (apiErr) {
      if (apiErr instanceof ApiError) throw apiErr;
      console.error('❌ Resend API network error:', apiErr.message);
      throw new ApiError(500, `Resend connection failed: ${apiErr.message}`);
    }
  }

  // 2. Try Brevo HTTP REST API if BREVO_API_KEY is configured (HTTPS port 443 - Never blocked on Render)
  if (env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Dinesh Yadav & Company', email: env.EMAIL_USER || 'deveshrao130@gmail.com' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`✉️ [Brevo API] OTP sent successfully to ${to}. MessageId: ${data.messageId}`);
        return { success: true, messageId: data.messageId, provider: 'brevo' };
      }
      console.warn('⚠️ Brevo API returned error:', data);
    } catch (apiErr) {
      console.warn('⚠️ Brevo API request failed:', apiErr.message);
    }
  }

  // 3. Fallback to Nodemailer SMTP (Works on localhost and paid cloud instances)
  try {
    const mailTransporter = getTransporter();
    const info = await mailTransporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email OTP (${purpose}) sent successfully via SMTP to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  } catch (error) {
    console.error(`❌ SMTP delivery to ${to} failed (${error.message}).`);
    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH' || error.message.includes('ENETUNREACH')) {
      throw new ApiError(
        500,
        'Render Free Tier blocks direct SMTP connections to Gmail. Please add RESEND_API_KEY in your Render Dashboard (Environment) to send real emails via Port 443.'
      );
    }
    throw new ApiError(500, `Failed to deliver verification email: ${error.message}`);
  }
};
