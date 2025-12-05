import nodemailer from 'nodemailer';

/**
 * Send password reset email with OTP
 */
export async function sendPasswordResetEmail(email: string, otp: string): Promise<void> {
  // Create transporter at runtime to ensure env vars are loaded
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  console.log('Sending email with user:', process.env.EMAIL_USER);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'PCOS Tracker - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EC4899;">Password Reset Request</h2>
        <p>You requested to reset your password for PCOS Tracker.</p>
        <p>Your OTP code is:</p>
        <div style="background: #FCE7F3; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #EC4899; letter-spacing: 8px;">${otp}</span>
        </div>
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px;">PCOS Tracker Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
