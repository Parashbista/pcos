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

/**
 * Send email verification code for signup
 */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('📧 SENDING EMAIL VERIFICATION CODE');
  console.log('='.repeat(60));
  console.log(`To: ${email}`);
  console.log(`Code: ${code}`);
  console.log(`Email User: ${process.env.EMAIL_USER}`);
  console.log(`Email Pass: ${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}`);
  console.log('='.repeat(60));

  // In development, log the code to console
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️  DEVELOPMENT MODE - Code logged above');
  }

  // Try to send email, but don't fail if it doesn't work in development
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📤 Attempting to send email...');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'PCOS Tracker - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EC4899;">Welcome to PCOS Tracker!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <p>Your verification code is:</p>
          <div style="background: #FCE7F3; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #EC4899; letter-spacing: 8px;">${code}</span>
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #888; font-size: 12px;">PCOS Tracker Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to ${email}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.log('='.repeat(60) + '\n');
    
    // In development, don't throw error - code is logged to console
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    } else {
      console.log('⚠️  Email failed but continuing in development mode');
      console.log('💡 Use the code shown above to verify');
    }
  }
}
