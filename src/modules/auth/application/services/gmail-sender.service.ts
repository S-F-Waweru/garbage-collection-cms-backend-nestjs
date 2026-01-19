// src/modules/auth/infrastructure/adapters/gmail-email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailSenderService } from './iemail-sender/iemail-sender.service';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class GmailEmailService implements IEmailSenderService {
  private readonly logger = new Logger(GmailEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly baseUrl: string;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const user = this.configService.get<string>('GMAIL_USER');
    const pass = this.configService.get<string>('GMAIL_PASSWORD');
    this.baseUrl = this.configService.get<string>('FRONTEND_URL')!;
    this.fromEmail = user!;

    if (!user || !pass) {
      this.logger.error('Gmail credentials missing. Email sending will fail.');
      throw new Error('Gmail configuration is incomplete');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendVerificationEmail(to: Email, token: string): Promise<void> {
    const verificationLink = `${this.baseUrl}/auth/verify-email?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: to.value,
      subject: 'Verify Your Email - Sustainable Sweeps',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #4CAF50; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to Sustainable Sweeps!</h2>
              <p>Thank you for registering. Please verify your email address to activate your account.</p>
              <a href="${verificationLink}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationLink}</p>
              <p>This link will expire in 1 hour.</p>
              <div class="footer">
                <p>If you didn't create an account, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Sustainable Sweeps. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to.value}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${to.value}`,
        error.stack,
      );
      // throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: Email, token: string): Promise<void> {
    const resetLink = `${this.baseUrl}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: to.value,
      subject: 'Reset Your Password - Sustainable Sweeps',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #2196F3; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
              }
              .warning { 
                background-color: #fff3cd; 
                padding: 15px; 
                border-left: 4px solid #ffc107; 
                margin: 20px 0;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetLink}</p>
              <p>This link will expire in 1 hour.</p>
              <div class="warning">
                <strong>⚠️ Security Note:</strong>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Sustainable Sweeps. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to.value}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${to.value}`,
        error.stack,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  async sendInvoiceEmail(
    to: Email,
    invoiceBuffer: Buffer,
    invoiceNumber: string,
  ) {
    const mailOptions = {
      from: this.fromEmail,
      to: to.value,
      subject: `Invoice ${invoiceNumber} - Sustainable Sweeps`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #2e7d32; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Your Invoice is Ready</h2>
            <p>Please find attached invoice <strong>${invoiceNumber}</strong> for your recent services.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>&copy; ${new Date().getFullYear()} Sustainable Sweeps. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: invoiceBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to.value}`, error.stack);
    }
    // throw new Error('Failed to send email to ${to.value}`);');
  }

  async sendInvitationEmail(
    to: Email,
    token: string,
    role: string,
  ): Promise<void> {
    const invitationLink = `${this.baseUrl}/auth/accept-invitation?token=${token}`;

    const mailOptions = {
      from: this.fromEmail,
      to: to.value,
      subject: "You've Been Invited to Join Sustainable Sweeps",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #9C27B0; 
                color: white; 
                text-decoration: none; 
                border-radius: 4px; 
                margin: 20px 0;
              }
              .role-badge {
                display: inline-block;
                padding: 4px 12px;
                background-color: #e3f2fd;
                color: #1976d2;
                border-radius: 12px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
              }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>You've Been Invited!</h2>
              <p>You've been invited to join Sustainable Sweeps as a <span class="role-badge">${role}</span>.</p>
              <a href="${invitationLink}" class="button">Accept Invitation</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${invitationLink}</p>
              <p>This invitation will expire in 7 days.</p>
              <div class="footer">
                <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Sustainable Sweeps. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${to.value} for role: ${role}`);
    } catch (error) {
      this.logger.warn(
        // Use warn, not error
        `Failed to send invitation email to ${to.value}: ${error.message}`,
      );
    }
  }
}
