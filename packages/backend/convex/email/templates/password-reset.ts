/**
 * Password reset email template for elcokiin - Diego Tenjo
 * 
 * Brand colors (from global.css):
 * - Primary Navy Blue: oklch(0.21 0.05 258) ≈ #1a1a2e
 * - Aquamarine accent: oklch(0.91 0.14 174) ≈ #5eead4
 * - Foreground light: oklch(0.92 0.02 271) ≈ #e5e7eb
 */

export type PasswordResetEmailData = {
  userName?: string;
  resetUrl: string;
};

/**
 * Generate HTML email template for password reset
 */
export function generatePasswordResetEmailHtml(data: PasswordResetEmailData): string {
  const { userName, resetUrl } = data;
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password - elcokiin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%); padding: 40px 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #5eead4; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                elcokiin
              </h1>
              <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 14px;">
                Diego Tenjo
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a2e; font-size: 24px; font-weight: 600;">
                Reset your password
              </h2>
              
              <p style="margin: 0 0 16px; color: #52525b; font-size: 16px; line-height: 1.6;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password. If you didn't make this request, you can safely ignore this email.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 30px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%); color: #1a1a2e; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(94, 234, 212, 0.4);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin: 0 0 10px; color: #71717a; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 30px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #5eead4; font-size: 14px; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </p>

              <!-- Security Notice -->
              <div style="padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>Security tip:</strong> This link will expire in 1 hour. Never share this link with anyone. We will never ask for your password via email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px; text-align: center;">
                This email was sent by <strong>elcokiin - Diego Tenjo</strong>
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                If you have any questions, please contact us at diego.tenjo@elcokiin.com
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
}

/**
 * Generate plain text email for password reset
 */
export function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  const { userName, resetUrl } = data;
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  return `
${greeting}

We received a request to reset your password for your elcokiin account.

Click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

Security tip: Never share this link with anyone. We will never ask for your password via email.

---
elcokiin - Diego Tenjo
diego.tenjo@elcokiin.com
  `.trim();
}
