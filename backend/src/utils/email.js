import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_SECURE === 'true' ? 465 : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"UHostel" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verification Code - UHostel',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 500px;
            margin: 20px auto;
            padding: 40px;
            border-radius: 16px;
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            border: 1px solid #f0f0f0;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: #4F46E5;
            letter-spacing: -1px;
          }
          .header {
            color: #1f2937;
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 10px;
          }
          .sub-header {
            color: #6b7280;
            font-size: 16px;
            text-align: center;
            margin-bottom: 30px;
          }
          .otp-container {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin-bottom: 30px;
          }
          .otp-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .footer {
            text-align: center;
            color: #9ca3af;
            font-size: 14px;
            margin-top: 30px;
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
          }
          .disclaimer {
            font-size: 12px;
            color: #d1d5db;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">UHostel</span>
          </div>
          <div class="header">Verify Your Identity</div>
          <div class="sub-header">Please use the following code to complete your verification process.</div>
          
          <div class="otp-container">
            <div class="otp-code">${otp}</div>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6; text-align: center;">
            This code is valid for <strong>10 minutes</strong>. For your security, please do not share this code with anyone.
          </p>
          
          <div class="footer">
            <p>&copy; 2026 UHostel. All rights reserved.</p>
            <div class="disclaimer">
              If you didn't request this code, you can safely ignore this email.
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw new Error('Email sending failed. Please check your SMTP configuration.');
  }
};
