import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { IMailService } from '../../core/domain/mail/mail.service.interface';
import type { MailOptions } from '../../core/domain/mail/mail.service.interface';

@Injectable()
export class MailService implements IMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const mailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendMail(options: MailOptions): Promise<void> {
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }
}
