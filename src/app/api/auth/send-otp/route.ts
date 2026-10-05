import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildOtpEmail(opts: { userName: string; otp: string; expiresIn: string }) {
  const { userName, otp, expiresIn } = opts;

  const digits = otp.split('');
  
  // Using strict inline styles for maximum email client compatibility (Gmail, Outlook, Apple Mail)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your verification code</title>
</head>
<body style="margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f111a; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f111a; width: 100%; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #161822; border: 1px solid #2a2d3d; border-radius: 12px; overflow: hidden; margin: 0 auto; text-align: left;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 28px; background-color: #1a1c29; border-bottom: 1px solid #2a2d3d;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="width: 32px; height: 32px; background-color: #312e81; border: 1px solid #4338ca; border-radius: 8px; text-align: center; vertical-align: middle; font-size: 16px; color: #a5b4fc;">⬡</td>
                  <td style="padding-left: 12px;">
                    <div style="font-size: 14px; font-weight: 600; color: #f8fafc; margin-bottom: 2px;">KnowledgeVault AI</div>
                    <div style="font-size: 11px; color: #64748b; font-family: 'Courier New', Courier, monospace;">Enterprise Knowledge Engine</div>
                  </td>
                </tr>
              </table>
              <div style="font-size: 26px; margin-bottom: 12px;">🔐</div>
              <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Verification Code</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">Use the code below to reset your KnowledgeVault AI password.</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                Hi <strong style="color: #f8fafc;">${userName}</strong>,<br/><br/>
                Here is your one-time verification code. Enter it on the password reset screen.
              </p>
              
              <div style="font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Your 6-digit code</div>
              
              <!-- OTP Boxes -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  ${digits.map(d => `<td style="padding-right: 8px;">
                    <div style="width: 44px; height: 52px; background-color: #0b0c10; border: 1.5px solid #4f46e5; border-radius: 8px; text-align: center; line-height: 52px; font-size: 24px; font-weight: 700; font-family: 'Courier New', Courier, monospace; color: #818cf8;">
                      ${d}
                    </div>
                  </td>`).join('')}
                </tr>
              </table>
              
              <div style="display: inline-block; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #fbbf24; background-color: #451a03; border: 1px solid #78350f; border-radius: 6px; padding: 6px 12px;">
                ⏱ Expires in ${expiresIn} · Single use
              </div>
              
              <div style="margin: 32px 0; border-top: 1px solid #2a2d3d;"></div>
              
              <div style="background-color: #064e3b; border: 1px solid #065f46; border-radius: 8px; padding: 14px; font-size: 12px; color: #a7f3d0; line-height: 1.6;">
                <strong style="color: #34d399;">Security notice:</strong> Never share this code with anyone. KnowledgeVault AI will never ask for your verification code. If you didn't request this, ignore this email.
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; border-top: 1px solid #2a2d3d; font-size: 11px; color: #475569; line-height: 1.6; text-align: center;">
              © 2026 KnowledgeVault AI · NovaTech Systems Inc.<br/>
              Automated security email — do not reply.
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `KnowledgeVault AI — Password Reset Code\n\nHi ${userName},\n\nYour verification code is: ${otp}\n\nThis code expires in ${expiresIn} and can only be used once.\n\nIf you didn't request this, ignore this email.\n\n— KnowledgeVault AI Team`;

  return { html, text };
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limiting: check if a code was sent in the last 60 seconds
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        used: false,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: 'A code was recently sent. Please wait before requesting another.' },
        { status: 429 }
      );
    }

    // Look up user
    const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });

    // Anti-enumeration: always respond success
    if (!user) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ success: true, message: 'If that email exists, a code has been sent.' });
    }

    // Invalidate any existing unused OTPs for this email
    await prisma.otpCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    });

    // Generate and store OTP
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma.otpCode.create({ data: { email: normalizedEmail, code, expiresAt } });

    // Send email
    const { html, text } = buildOtpEmail({ userName: user.name || normalizedEmail, otp: code, expiresIn: '10 minutes' });
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: `${code} is your KnowledgeVault AI verification code`,
      html,
      text,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    const isConsoleFallback = emailResult.provider === 'console';

    return NextResponse.json({
      success: true,
      message: 'If that email exists, a code has been sent.',
      provider: emailResult.provider,
      ...(isDev && isConsoleFallback ? { _devCode: code } : {}),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send code. Please try again.' }, { status: 500 });
  }
}
