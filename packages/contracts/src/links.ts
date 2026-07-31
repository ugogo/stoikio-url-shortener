import { z } from 'zod';

import { MAX_DESTINATION_LENGTH, parseDestination } from './destination';

export const createShortLinkSchema = z.strictObject({
  destination: z.string().transform((value, ctx) => {
    const parsed = parseDestination(value);

    if (parsed === null) {
      ctx.addIssue({
        code: 'custom',
        message: `Use an http or https URL of at most ${String(MAX_DESTINATION_LENGTH)} characters.`,
      });

      return z.NEVER;
    }

    return parsed;
  }),
});

export type CreateShortLinkBody = z.infer<typeof createShortLinkSchema>;

export const createdShortLinkSchema = z.object({
  createdAt: z.string(),
  destination: z.string(),
  slug: z.string(),
});

export type CreatedShortLink = z.infer<typeof createdShortLinkSchema>;
