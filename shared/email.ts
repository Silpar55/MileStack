import sgMail from "@sendgrid/mail";
import { generateSecureToken } from "./auth";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates
const EMAIL_TEMPLATES = {
  verification: {
    subject: "Verify your MileStack account",
    html: (name: string, verificationLink: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your MileStack account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MileStack!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            
            <p>Thank you for signing up for MileStack! To complete your registration and start your educational journey, please verify your email address.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${verificationLink}
            </p>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6c757d;">
              If you didn't create an account with MileStack, please ignore this email. 
              This verification link will expire in 24 hours.
            </p>
          </div>
        </body>
      </html>
    `,
    text: (name: string, verificationLink: string) => `
      Hi ${name},
      
      Thank you for signing up for MileStack! To complete your registration, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours for security reasons.
      
      If you didn't create an account with MileStack, please ignore this email.
      
      Best regards,
      The MileStack Team
    `,
  },

  passwordReset: {
    subject: "Reset your MileStack password",
    html: (name: string, resetLink: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your MileStack password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            
            <p>We received a request to reset your MileStack account password. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${resetLink}
            </p>
            
            <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6c757d;">
              If you didn't request a password reset, please ignore this email. 
              Your password will remain unchanged.
            </p>
          </div>
        </body>
      </html>
    `,
    text: (name: string, resetLink: string) => `
      Hi ${name},
      
      We received a request to reset your MileStack account password. If you made this request, click the link below to reset your password:
      
      ${resetLink}
      
      This password reset link will expire in 1 hour for security reasons.
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      
      Best regards,
      The MileStack Team
    `,
  },

  welcome: {
    subject: "Welcome to MileStack!",
    html: (name: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MileStack!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MileStack!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
            
            <p>Welcome to MileStack! Your account has been successfully verified and you're ready to start your educational journey.</p>
            
            <p>Here's what you can do next:</p>
            <ul>
              <li>Complete your profile setup</li>
              <li>Explore our challenge library</li>
              <li>Join study groups and connect with peers</li>
              <li>Track your learning progress</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy learning!</p>
            <p><strong>The MileStack Team</strong></p>
          </div>
        </body>
      </html>
    `,
    text: (name: string) => `
      Hi ${name},
      
      Welcome to MileStack! Your account has been successfully verified and you're ready to start your educational journey.
      
      Here's what you can do next:
      - Complete your profile setup
      - Explore our challenge library
      - Join study groups and connect with peers
      - Track your learning progress
      
      Visit your dashboard: ${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/dashboard
      
      If you have any questions, feel free to reach out to our support team.
      
      Happy learning!
      The MileStack Team
    `,
  },
};

// Email service class
export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send email verification
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      const verificationLink = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/auth/verify-email/${verificationToken}`;

      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@milestack.com",
          name: "MileStack Team",
        },
        subject: EMAIL_TEMPLATES.verification.subject,
        text: EMAIL_TEMPLATES.verification.text(name, verificationLink),
        html: EMAIL_TEMPLATES.verification.html(name, verificationLink),
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      } else {
        console.log("SendGrid not configured. Email would be sent:", msg);
      }

      return true;
    } catch (error) {
      console.error("Error sending verification email:", error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      const resetLink = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/reset-password?token=${resetToken}`;

      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@milestack.com",
          name: "MileStack Team",
        },
        subject: EMAIL_TEMPLATES.passwordReset.subject,
        text: EMAIL_TEMPLATES.passwordReset.text(name, resetLink),
        html: EMAIL_TEMPLATES.passwordReset.html(name, resetLink),
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      } else {
        console.log("SendGrid not configured. Email would be sent:", msg);
      }

      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@milestack.com",
          name: "MileStack Team",
        },
        subject: EMAIL_TEMPLATES.welcome.subject,
        text: EMAIL_TEMPLATES.welcome.text(name),
        html: EMAIL_TEMPLATES.welcome.html(name),
      };

      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send(msg);
      } else {
        console.log("SendGrid not configured. Email would be sent:", msg);
      }

      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
