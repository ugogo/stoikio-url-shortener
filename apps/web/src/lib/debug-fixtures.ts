export const DEBUG_STATES = ['idle', 'pending', 'success', 'error', 'not-found'] as const;

export type DebugState = (typeof DEBUG_STATES)[number];

export const DEBUG_SLUG = 'n2HOcjq7';

export const DEBUG_DESTINATION =
  'https://example.com/a/genuinely/long/page/path?utm_source=newsletter&utm_campaign=spring';

export const DEBUG_SHORT_LINK_URL = `https://stoik.io/l/${DEBUG_SLUG}`;

export const DEBUG_ERROR = 'Use an http or https URL of at most 2048 characters.';
