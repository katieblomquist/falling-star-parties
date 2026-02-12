import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    // Gmail configuration (you can modify this for other providers)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    if (!emailUser || !emailPass) {
      throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS environment variables are required');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Additional options for Google Workspace
      tls: {
        rejectUnauthorized: false // This can help with some corporate firewalls
      }
    });

    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const startTime = Date.now();
    
    logger.debug("Starting email send operation", {
      to: options.to,
      subject: options.subject,
      htmlLength: options.html.length,
      from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER
    });

    try {
      const transporter = await this.getTransporter();
      
      const mailOptions = {
        from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      logger.debug("Sending email via SMTP", {
        to: options.to,
        from: mailOptions.from,
        subject: options.subject
      });

      const result = await transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;
      
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
        duration,
        response: result.response
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = error instanceof Error ? error.constructor.name : typeof error;
      
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        duration,
        errorMessage,
        errorType,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        emailUser: process.env.EMAIL_USER
      }, error);
      
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async testConnection(): Promise<boolean> {
    const startTime = Date.now();
    
    logger.info("Testing email connection", {
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      emailUser: process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS
    });

    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      const duration = Date.now() - startTime;
      
      logger.info('Email connection test successful', {
        duration,
        smtpHost: process.env.SMTP_HOST,
        emailUser: process.env.EMAIL_USER
      });
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorType = error instanceof Error ? error.constructor.name : typeof error;
      
      logger.error('Email connection test failed', {
        duration,
        errorMessage,
        errorType,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        emailUser: process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS
      }, error);
      
      return false;
    }
  }
}

export const emailService = new EmailService();