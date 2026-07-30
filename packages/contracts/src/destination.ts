const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

export const MAX_DESTINATION_LENGTH = 2048;

/** Scheme allowlist so `javascript:` fails closed; the host is unrestricted. */
export function parseDestination(value: unknown): null | string {
  if (typeof value !== 'string' || value.length > MAX_DESTINATION_LENGTH) {
    return null;
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null;
}
