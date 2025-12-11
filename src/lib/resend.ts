/**
 * Node modules
 */
import { Resend } from 'resend';
import config from '@/config';

const resend = new Resend(config.RESEND_API_KEY);

interface EmailParams {
  subject: string;
  emails: string[] | string;
  content: string;
}

export const sendEmail = async ({ emails, subject, content }: EmailParams) => {
  const recipients = Array.isArray(emails) ? emails : [emails];

  return await resend.emails.send({
    from: 'DevJourney <devjourney@storemystuff.cloud>',
    to: 'DevJourney <support@storemystuff.cloud>',
    bcc: recipients,
    subject,
    html: content,
  });
};
