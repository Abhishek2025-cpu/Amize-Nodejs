// services/emailService.js

const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
// Add this line to get the frontend URL for links in emails
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ... (transporter and getEmailTemplate functions remain the same) ...
// ...

/**
 * Sends a verification code email
 */
async function sendVerificationCodeEmail(email, firstName, verificationCode) {
    const content = `
        <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 16px; color: white; font-size: 28px; font-weight: 700;">Verify Your Email</h2>
            <p style="margin: 0; color: #d1d5db; font-size: 16px; line-height: 1.6;">Almost there! Please verify your email address to get started.</p>
        </div>
        <div style="margin-bottom: 32px;">
            <p style="margin: 0 0 24px; color: #d1d5db; font-size: 16px; line-height: 1.6;">Hello ${firstName || 'there'},</p>
            <p style="margin: 0 0 32px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for Amize! To complete your registration, please use the verification code below:
            </p>
        </div>
        <div style="text-align: center; margin: 40px 0;">
            <div style="background: linear-gradient(135deg, #1f2937, #374151); border: 2px solid #ec4899; border-radius: 16px; padding: 24px; display: inline-block;">
                <p style="margin: 0 0 8px; color: #ec4899; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Verification Code</p>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: white; font-family: 'Courier New', monospace;">
                    ${verificationCode}
                </div>
            </div>
        </div>
        <div style="background: #1f2937; border-radius: 12px; padding: 24px; margin: 32px 0; border-left: 4px solid #ec4899;">
            <p style="margin: 0 0 12px; color: #f59e0b; font-size: 14px; font-weight: 600;">Important Information</p>
            <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">This code will expire in 10 minutes.</li>
                <li>If you didn't create an account, you can safely ignore this email.</li>
            </ul>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Verify Your Amize Account',
        text: `Your Amize verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
        html: getEmailTemplate(content),
    });
}


module.exports = {
    sendWelcomeEmail,
    generateVerificationCode,
    sendVerificationCodeEmail, // <--- EXPORT THE NEW FUNCTION
};