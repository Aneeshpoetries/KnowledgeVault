/**
 * KnowledgeVault AI — Email Service
 *
 * Priority: RESEND_API_KEY > SMTP (Gmail/Outlook) > Console fallback (dev)
 *
 * Setup:
 *   Option A (Resend): Set RESEND_API_KEY in .env
 *   Option B (Gmail):  Set SMTP_USER + SMTP_PASS (App Password) in .env
 */

import nodemailer from 'nodemailer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  provider?: string;
  messageId?: string;
  error?: string;
}

// ─── HTML Email Templates ─────────────────────────────────────────────────────

export function buildPasswordResetEmail(opts: {
  userName: string;
  resetLink: string;
  expiresIn?: string;
  appUrl?: string;
}): { html: string; text: string } {
  const { userName, resetLink, expiresIn = '1 hour', appUrl = 'http://localhost:3000' } = opts;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password — KnowledgeVault AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0b0f; color: #e2e8f0; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111218; border: 1px solid #1e2030; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1b2e 0%, #111218 100%); padding: 36px 40px 32px; border-bottom: 1px solid #1e2030; }
    .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .logo-icon { width: 36px; height: 36px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; line-height: 1; }
    .logo-text { font-size: 14px; font-weight: 600; color: #e2e8f0; letter-spacing: -0.02em; }
    .logo-sub { font-size: 11px; color: #64748b; font-family: 'Courier New', monospace; }
    .shield-wrap { width: 56px; height: 56px; background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px; }
    .headline { font-size: 22px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.03em; margin-bottom: 8px; }
    .sub { font-size: 13px; color: #64748b; line-height: 1.6; }
    .body { padding: 32px 40px; }
    .greeting { font-size: 14px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
    .greeting strong { color: #e2e8f0; }
    .btn-wrap { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35); }
    .divider { border: none; border-top: 1px solid #1e2030; margin: 24px 0; }
    .link-fallback { background: #0d0e14; border: 1px solid #1e2030; border-radius: 10px; padding: 14px 16px; }
    .link-label { font-size: 11px; font-family: 'Courier New', monospace; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .link-url { font-size: 11px; font-family: 'Courier New', monospace; color: #818cf8; word-break: break-all; line-height: 1.5; }
    .expiry-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #fbbf24; font-family: 'Courier New', monospace; margin-bottom: 24px; }
    .security-note { background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #6b7280; line-height: 1.6; margin-top: 24px; }
    .security-note strong { color: #34d399; }
    .footer { padding: 20px 40px; border-top: 1px solid #1e2030; display: flex; align-items: center; justify-content: space-between; }
    .footer-text { font-size: 11px; color: #374151; line-height: 1.6; }
    .footer-logo { font-size: 11px; color: #374151; font-family: 'Courier New', monospace; }
    @media (max-width: 600px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
      .headline { font-size: 18px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="logo-row">
          <div class="logo-icon">⬡</div>
          <div>
            <div class="logo-text">KnowledgeVault AI</div>
            <div class="logo-sub">Enterprise Knowledge Continuity Engine</div>
          </div>
        </div>
        <div class="shield-wrap">🔑</div>
        <div class="headline">Reset Your Password</div>
        <div class="sub">A password reset was requested for your account. Click the button below to set a new password.</div>
      </div>

      <!-- Body -->
      <div class="body">
        <div class="greeting">
          Hi <strong>${userName}</strong>,<br /><br />
          We received a request to reset the password for your KnowledgeVault AI account associated with this email address. If you didn't make this request, you can safely ignore this email — your password will remain unchanged.
        </div>

        <!-- Expiry badge -->
        <div class="expiry-badge">
          ⏱ Link expires in ${expiresIn}
        </div>

        <!-- CTA Button -->
        <div class="btn-wrap">
          <a href="${resetLink}" class="btn">Reset My Password →</a>
        </div>

        <hr class="divider" />

        <!-- Fallback link -->
        <div class="link-fallback">
          <div class="link-label">Or copy & paste this URL into your browser</div>
          <div class="link-url">${resetLink}</div>
        </div>

        <!-- Security note -->
        <div class="security-note">
          <strong>Security notice:</strong> This link is single-use and expires in ${expiresIn}. Never share this link with anyone. KnowledgeVault AI will never ask for your password via email.
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-text">
          © 2026 KnowledgeVault AI · NovaTech Systems Inc.<br />
          This is an automated security email, please do not reply.
        </div>
        <div class="footer-logo">kv.ai</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `
KnowledgeVault AI — Password Reset

Hi ${userName},

A password reset was requested for your KnowledgeVault AI account.

Reset link (expires in ${expiresIn}):
${resetLink}

If you didn't request this, please ignore this email.

Security: This link is single-use and expires in ${expiresIn}. Never share this link.

— KnowledgeVault AI Team
`;

  return { html, text };
}

export function buildPasswordChangedEmail(opts: {
  userName: string;
  appUrl?: string;
}): { html: string; text: string } {
  const { userName, appUrl = 'http://localhost:3000' } = opts;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed — KnowledgeVault AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0b0f; color: #e2e8f0; }
    .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111218; border: 1px solid #1e2030; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1a14 0%, #111218 100%); padding: 36px 40px 32px; border-bottom: 1px solid #1e2030; }
    .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
    .logo-icon { width: 36px; height: 36px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; line-height: 1; }
    .logo-text { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .logo-sub { font-size: 11px; color: #64748b; font-family: 'Courier New', monospace; }
    .check-wrap { width: 56px; height: 56px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 16px; }
    .headline { font-size: 22px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.03em; margin-bottom: 8px; }
    .sub { font-size: 13px; color: #64748b; line-height: 1.6; }
    .body { padding: 32px 40px; }
    .greeting { font-size: 14px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
    .greeting strong { color: #e2e8f0; }
    .success-badge { display: flex; align-items: center; gap: 8px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
    .success-badge-icon { font-size: 18px; }
    .success-badge-text { font-size: 13px; color: #34d399; font-weight: 500; }
    .alert-box { background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #94a3b8; line-height: 1.6; margin-top: 20px; }
    .alert-box strong { color: #f87171; }
    .btn-wrap { text-align: center; margin: 24px 0 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 13px; font-weight: 600; }
    .footer { padding: 20px 40px; border-top: 1px solid #1e2030; }
    .footer-text { font-size: 11px; color: #374151; line-height: 1.6; }
    @media (max-width: 600px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-row">
          <div class="logo-icon">⬡</div>
          <div>
            <div class="logo-text">KnowledgeVault AI</div>
            <div class="logo-sub">Enterprise Knowledge Continuity Engine</div>
          </div>
        </div>
        <div class="check-wrap">✅</div>
        <div class="headline">Password Changed Successfully</div>
        <div class="sub">Your account password has been updated.</div>
      </div>
      <div class="body">
        <div class="greeting">Hi <strong>${userName}</strong>,</div>
        <div class="success-badge">
          <span class="success-badge-icon">🔐</span>
          <span class="success-badge-text">Your KnowledgeVault AI password was changed successfully.</span>
        </div>
        <div class="greeting" style="margin-top:16px">
          This change was applied to your account on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}.
        </div>
        <div class="alert-box">
          <strong>⚠ Wasn't you?</strong> If you did not make this change, your account may be compromised. Please <a href="${appUrl}/forgot-password" style="color: #f87171;">reset your password immediately</a> and contact your workspace administrator.
        </div>
        <div class="btn-wrap">
          <a href="${appUrl}/login" class="btn">Sign In to Your Account →</a>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">
          © 2026 KnowledgeVault AI · NovaTech Systems Inc.<br />
          This is an automated security notification. If you have concerns, contact your workspace admin.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `
KnowledgeVault AI — Password Changed

Hi ${userName},

Your KnowledgeVault AI password was changed successfully.

If you didn't make this change, reset your password immediately at:
${appUrl}/forgot-password

— KnowledgeVault AI Team
`;

  return { html, text };
}

// ─── Core Send Function ───────────────────────────────────────────────────────

export async function sendEmail(opts: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, text } = opts;

  // 1. Try Resend (primary)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const from = process.env.EMAIL_FROM || 'KnowledgeVault AI <onboarding@resend.dev>';
      const { data, error } = await resend.emails.send({ from, to, subject, html, text });

      if (error) throw new Error(error.message);

      return { success: true, provider: 'resend', messageId: data?.id };
    } catch (err: any) {
      console.error('[Email] Resend failed:', err.message);
      // Fall through to SMTP
    }
  }

  // 2. Try SMTP (Gmail / Outlook / custom)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      const from = process.env.SMTP_FROM || `KnowledgeVault AI <${process.env.SMTP_USER}>`;
      const info = await transporter.sendMail({ from, to, subject, html, text });

      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err: any) {
      console.error('[Email] SMTP failed:', err.message);
      // Fall through to console fallback
    }
  }

  // 3. Console fallback (development only)
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.log('\n' + '═'.repeat(60));
    console.log('📧  EMAIL (Console Fallback — No provider configured)');
    console.log('═'.repeat(60));
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${text || '(html email)'}`);
    console.log('═'.repeat(60) + '\n');
    return { success: true, provider: 'console', messageId: 'console-' + Date.now() };
  }

  return {
    success: false,
    error: 'No email provider configured. Set RESEND_API_KEY or SMTP_USER + SMTP_PASS in .env',
  };
}

// ─── High-level helpers ───────────────────────────────────────────────────────

export async function sendPasswordResetEmail(opts: {
  to: string;
  userName: string;
  resetLink: string;
}): Promise<EmailResult> {
  const { html, text } = buildPasswordResetEmail({
    userName: opts.userName,
    resetLink: opts.resetLink,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  return sendEmail({
    to: opts.to,
    subject: '🔑 Reset your KnowledgeVault AI password',
    html,
    text,
  });
}

export async function sendPasswordChangedEmail(opts: {
  to: string;
  userName: string;
}): Promise<EmailResult> {
  const { html, text } = buildPasswordChangedEmail({
    userName: opts.userName,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  return sendEmail({
    to: opts.to,
    subject: '✅ Your KnowledgeVault AI password was changed',
    html,
    text,
  });
}
