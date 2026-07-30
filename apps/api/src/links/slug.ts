import { randomBytes } from 'node:crypto';

// Six bytes → eight URL-safe chars, no padding, no modulo bias.
const SLUG_BYTES = 6;

export function generateSlug(): string {
  return randomBytes(SLUG_BYTES).toString('base64url');
}
