const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another like 'outlook', 'sendinblue', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (to, name, token) => {
  const verifyLink = `${process.env.BASE_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"NutriPlanWellness" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email - NutriPlanWellness',
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for registering! Please verify your email by clicking the link below:</p>
      <a href="${verifyLink}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPersonalizedDietEmail = async (to, name, pdfPath) => {
  const pdfFile = fs.readFileSync(pdfPath);
  const mailOptions = {
    from: `"NutriPlanWellness" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎯 Your Personalized Diet Plan is Ready!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #1a73e8;">Hi ${name},</h2>
        <p>We're excited to share that your personalized diet plan is ready! 🎉</p>
        <p>Based on your responses, our expert team has crafted a plan tailored to your health goals.</p>
        <p>You’ll find your custom PDF attached to this email. Download it, read it carefully, and start your wellness journey today 💪</p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 13px; color: #888;">
          Need help understanding your plan? Reach out to us any time.
        </p>
        <p style="font-size: 13px; color: #888;">
          Stay healthy,<br/>NutriPlanWellness Team
        </p>
      </div>
    `,
    attachments: [
      {
        filename: path.basename(pdfPath),
        content: pdfFile,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (to, name, token) => {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"NutriPlanWellness" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Reset Your Password - NutriPlanWellness',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #E26A4A;">Hi ${name},</h2>
        <p>We received a request to reset your password. You can reset it by clicking the link below:</p>
        <p><a href="${resetLink}" style="color: #1a73e8;">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you didn’t request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 20px 0;" />
        <p style="font-size: 13px; color: #888;">
          Stay secure,<br/>NutriPlanWellness Team
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};