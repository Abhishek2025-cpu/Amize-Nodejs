// services/emailService.js

const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!SMTP_USER || !SMTP_PASS) {
    console.warn("WARNING: SMTP credentials are not defined in .env file. Email sending will be disabled.");
}

// Create a single, reusable transporter object
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

/**
 * Base email template with Amize branding
 */
function getEmailTemplate(content) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amize</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; background: #121212; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);">
            <div style="background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); padding: 32px 40px; text-align: center; position: relative;">
                 <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Amize</h1>
                 <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">Create, Share & Discover Amazing Videos</p>
            </div>
            <div style="padding: 40px;">
                ${content}
            </div>
            <div style="background: #1a1a1a; padding: 32px 40px; text-align: center; border-top: 1px solid #2a2a2a;">
                 <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.6;">
                    © ${new Date().getFullYear()} Amize, Inc. All rights reserved.<br>
                    Made for creators worldwide
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Sends an email.
 */
async function sendEmail(options) {
    if (!SMTP_USER || !SMTP_PASS) {
        console.error("Cannot send email: SMTP not configured.");
        return;
    }
    try {
        const mailOptions = {
            from: `"Amize" <${SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Email sending error to ${options.to}:`, error);
        throw error;
    }
}

/**
 * Generate a random numeric verification code
 */
function generateVerificationCode(length = 6) {
    return Math.random().toString().substring(2, 2 + length).padStart(length, '0');
}

// =========================================================
//                  CORRECTED SECTION
// =========================================================

/**
 * Sends a welcome email after successful verification
 */
async function sendWelcomeEmail(email, name) {
    const content = `
        <div style="text-align: center; margin-bottom: 40px;">
            <h2 style="margin: 0 0 16px; color: white; font-size: 32px; font-weight: 700;">Welcome to Amize!</h2>
            <p style="margin: 0; color: #d1d5db; font-size: 18px; line-height: 1.6;">Your creative journey starts now</p>
        </div>
        <div style="margin-bottom: 40px;">
            <p style="margin: 0 0 24px; color: #d1d5db; font-size: 18px; line-height: 1.6;">Hello ${name},</p>
            <p style="margin: 0 0 32px; color: #d1d5db; font-size: 16px; line-height: 1.8;">
                Congratulations! Your Amize account has been successfully verified. We are thrilled to have you join our amazing community of creators.
            </p>
        </div>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ec4899, #ef4444); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                Start Creating
            </a>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: "Welcome to Amize - Let's Create Something Amazing!",
        text: `Hello ${name}, welcome to Amize! You're ready to start creating amazing videos.`,
        html: getEmailTemplate(content),
    });
}

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
    `;

    await sendEmail({
        to: email,
        subject: 'Verify Your Amize Account',
        text: `Your Amize verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
        html: getEmailTemplate(content),
    });
}

// This is the module export section
module.exports = {
    sendWelcomeEmail,
    generateVerificationCode,
    sendVerificationCodeEmail,
};