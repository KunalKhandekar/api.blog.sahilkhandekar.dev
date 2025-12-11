/**
 * Node modules
 */
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

/**
 * Models
 */
import Subscriber from '@/models/subscriber';

/**
 * Generate a random username (e.g. user-abc123)
 */
export const generateUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2);
  return usernamePrefix + randomChars;
};

/**
 * Generate a random slug from a title (e.g. my-title-abc123)
 * @param title The title to generate a slug from
 * @returns A random slug
 */
export const generateSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, '')
    .replace(/\s-+/g, '-')
    .replace(/-+/g, '-');
  const randomChars = Math.random().toString(36).slice(2);

  return `${slug}-${randomChars}`;
};

const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize content using DOMPurify
 * @param content The content to sanitize
 * @returns The sanitized content
 */
export const sanitizeContent = (content: string): string => {
  return purify.sanitize(content);
};

/**
 *
 */
export const createSubscriber = async (email: string) => {
  try {
    const subscriber = await Subscriber.findOne({ email }).lean().exec();
    if (subscriber) {
      return subscriber;
    }
    const newSubscriber = await Subscriber.create({ email });
    return newSubscriber;
  } catch (error) {
    throw new Error(`Error creating subscriber: ${email}`);
  }
};

export const emailTemplate = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return `
    <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
      <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
        <h1 style="color: #333; text-align: center;">${title}</h1>
        <p style="font-size: 16px; color: #555;">${message}</p>
      </div>
    </div>
  `;
};
