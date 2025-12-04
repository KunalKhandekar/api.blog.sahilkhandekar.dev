/**
 * Node modules
 */
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

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
