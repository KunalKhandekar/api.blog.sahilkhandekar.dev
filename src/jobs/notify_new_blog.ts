/**
 * Node modules
 */
import { Job } from 'agenda';

/**
 * Custom modules
 */
import { logger } from '@/lib/winston';
import { sendEmail } from '@/lib/resend';
import { emailTemplate } from '@/utils';

/**
 * Models
 */
import Blog from '@/models/blog';
import Subscriber from '@/models/subscriber';

export const NOTIFY_NEW_BLOG = 'NOTIFY_NEW_BLOG';

export const handleNotifyNewBlog = async (job: Job) => {
  const { blogId } = job.attrs.data;
  try {
    logger.info(`Starting notify new blog job for blog ID: ${blogId}`);
    const blog = await Blog.findById(blogId).select('title').lean().exec();
    if (!blog) {
      throw new Error(`Blog with ID ${blogId} not found`);
    }

    const batchSize = 20;

    const subscribers = await Subscriber.find().select('email').lean().exec();
    const emails = subscribers.map((s) => s.email);

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      logger.info(
        `Sending batch ${i / batchSize + 1} of ${Math.ceil(emails.length / batchSize)}`,
      );

      await sendEmail({
        emails: batch,
        subject: 'New Blog Posted',
        content: emailTemplate({
          title: blog.title,
          message: `A new blog has been posted. Check it out! 🚀 <a href='https://devjourney.sahilkhandekar.dev'>DevJourney</a>`,
        }),
      });
    }

    logger.info(
      `Successfully sent new blog notification for blog ID: ${blogId}`,
    );
  } catch (error) {
    logger.error(`Failed while sending blog notification: ${error}`);
    throw error;
  }
};
