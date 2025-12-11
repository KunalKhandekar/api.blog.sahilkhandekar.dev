/**
 * Custom modules
*/
import agenda from '@/lib/agenda';
import { SEND_WELCOME_EMAIL_JOB, handleWelcomeEmail } from '@/jobs/welcome_subscriber';
import { handleNotifyNewBlog, NOTIFY_NEW_BLOG } from '@/jobs/notify_new_blog';

export const defineJobs = () => {
  agenda.define(SEND_WELCOME_EMAIL_JOB, handleWelcomeEmail);
  agenda.define(NOTIFY_NEW_BLOG, handleNotifyNewBlog);
};