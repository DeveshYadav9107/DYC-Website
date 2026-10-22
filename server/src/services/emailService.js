import nodemailer from 'nodemailer';
import env from '../config/env.js';
import ApiError from '../utils/apiError.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_USER or EMAIL_PASSWORD is missing in server environment.');
    throw new ApiError(
      500,
      'Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD on the server.'
    );
  }

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || 'smtp.gmail.com',
    port: env.EMAIL_PORT || 587,
    secure: env.EMAIL_SECURE,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  });

  return transporter;
};

export const sendOtpEmail = async ({ to, otp, purpose, firstName = '' }) => {
  const mailTransporter = getTransporter();

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

  // In development, log the OTP directly to console for instant developer convenience
  if (env.NODE_ENV !== 'production') {
    console.log(`\n==================================================`);
    console.log(`🔑 [DEV MODE OTP] Purpose: ${purpose.toUpperCase()} | To: ${to}`);
    console.log(`👉 OTP CODE: >>> ${otp} <<<`);
    console.log(`==================================================\n`);
  }

  try {
    const info = await mailTransporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email OTP (${purpose}) sent successfully to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
    throw new ApiError(500, `Failed to deliver verification email: ${error.message}`);
  }
};
