/** Copied from the API. */

export const DEBUG_STATES = ['idle', 'pending', 'success', 'error'] as const;

export type DebugState = (typeof DEBUG_STATES)[number];

/** Long enough to truncate. */
export const DEBUG_DESTINATION =
  'https://example.com/a/genuinely/long/page/path?utm_source=newsletter&utm_campaign=spring';

export const DEBUG_SHORT_LINK_URL = 'https://stoik.io/l/n2HOcjq7';

/** The API's rejection for a bad destination, verbatim. */
export const DEBUG_ERROR = 'Use an http or https URL of at most 2048 characters.';
