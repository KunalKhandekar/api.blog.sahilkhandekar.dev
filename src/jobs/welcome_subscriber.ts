/**
 * Node modules
 */
import { Job } from 'agenda';
import { logger } from '@/lib/winston';
import { sendEmail } from '@/lib/resend';
import { emailTemplate } from '@/utils';

export const SEND_WELCOME_EMAIL_JOB = 'SEND_WELCOME_EMAIL_JOB';

export const handleWelcomeEmail = async (job: Job) => {
  const { email } = job.attrs.data;
  try {
    logger.info(`Starting welcome email job for: ${email}`);

    await sendEmail({
      emails: email,
      subject: 'Welcome to DevJourney',
      content: emailTemplate({
        title: 'Welcome to DevJourney',
        message: `We're excited to have you on board. You will receive regular updates from us. Happy coding! 🚀`,
      }),
    });

    logger.info(`Successfully sent welcome email to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${email}`, error);
    throw error;
  }
};
