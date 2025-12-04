// src/modules/auth/application/services/email-sender.service.ts

import { Email } from '../../../domain/value-objects/email.vo';

export interface IEmailSenderService {
  /**
   * Send email verification link after registration
   * @param to - User email
   * @param token - Plain verification token (NOT hash)
   */
  sendVerificationEmail(to: Email, token: string): Promise<void>;

  /**
   * Send password reset link
   * @param to - User email
   * @param token - Plain reset token (NOT hash)
   */
  sendPasswordResetEmail(to: Email, token: string): Promise<void>;

  /**
   * Send staff invitation link
   * @param to - Staff email
   * @param token - Plain invitation token (NOT hash)
   * @param role - Role being assigned
   */
  sendInvitationEmail(to: Email, token: string, role: string): Promise<void>;
}

export const IEmailSenderService = Symbol('IEmailSenderService');
