import { BrevoClient } from '@getbrevo/brevo';
import { env } from '../config/env.js';

let client = null;

const getClient = () => {
  if (!env.brevo.apiKey) return null;
  if (!client) client = new BrevoClient({ apiKey: env.brevo.apiKey });
  return client;
};

/**
 * Sends a 6-digit verification code to a newly registered staff member.
 * If BREVO_API_KEY isn't configured, logs the code to the console instead of
 * throwing — useful for local development without a real Brevo account.
 */
export const sendVerificationEmail = async ({ to, name, code }) => {
  const brevo = getClient();

  if (!brevo) {
    console.warn(`[email] BREVO_API_KEY not set — verification code for ${to} is: ${code}`);
    return { simulated: true };
  }

  return brevo.transactionalEmails.sendTransacEmail({
    subject: 'Verify your BizPilot account',
    sender: { name: env.brevo.senderName, email: env.brevo.senderEmail },
    to: [{ email: to, name }],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563EB;">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Use the code below to verify your BizPilot account. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #F8FAFC; padding: 16px 24px; border-radius: 10px; text-align: center;">${code}</p>
        <p style="color: #64748B; font-size: 13px;">If you didn't create a BizPilot account, you can safely ignore this email.</p>
      </div>
    `,
    textContent: `Hi ${name}, your BizPilot verification code is ${code}. It expires in 10 minutes.`,
  });
};

/**
 * Sends a 6-digit password-reset code. Same "log instead of throw" fallback as
 * sendVerificationEmail when BREVO_API_KEY isn't configured, so local dev works
 * without a real Brevo account.
 */
export const sendPasswordResetEmail = async ({ to, name, code }) => {
  const brevo = getClient();

  if (!brevo) {
    console.warn(`[email] BREVO_API_KEY not set — password reset code for ${to} is: ${code}`);
    return { simulated: true };
  }

  return brevo.transactionalEmails.sendTransacEmail({
    subject: 'Reset your BizPilot password',
    sender: { name: env.brevo.senderName, email: env.brevo.senderEmail },
    to: [{ email: to, name }],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563EB;">Reset your password</h2>
        <p>Hi ${name},</p>
        <p>Use the code below to reset your BizPilot password. It expires in 10 minutes.</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #F8FAFC; padding: 16px 24px; border-radius: 10px; text-align: center;">${code}</p>
        <p style="color: #64748B; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
      </div>
    `,
    textContent: `Hi ${name}, your BizPilot password reset code is ${code}. It expires in 10 minutes.`,
  });
};

export default { sendVerificationEmail, sendPasswordResetEmail };
