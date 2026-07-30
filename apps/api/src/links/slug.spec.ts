import { describe, expect, it } from 'vitest';

import { generateSlug } from './slug';

describe('generateSlug', () => {
  it('produces eight base64url characters, with no padding', () => {
    expect(generateSlug()).toMatch(/^[A-Za-z0-9_-]{8}$/);
  });
});
