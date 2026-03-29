import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"UHostel Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'UHostel Account Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">UHostel Verification</h2>
        <p>Hello,</p>
        <p>Your OTP for UHostel account verification is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; border-radius: 5px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>The UHostel Team</p>
      </div>
    `
  };

  try {
    if (process.env.EMAIL_USER === 'your_gmail@gmail.com' || !process.env.EMAIL_USER) {
      console.log(`\n================================`);
      console.log(`[DEV MODE] Simulated email to ${email}`);
      console.log(`OTP is: ${otp}`);
      console.log(`================================\n`);
      return; 
    }
    
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw new Error('Email sending failed');
  }
};
