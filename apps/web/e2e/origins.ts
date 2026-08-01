/**
 * Ports of the suite's own, so `pnpm test:e2e` runs while `pnpm dev` holds 3000/3001.
 * `playwright.config.ts` starts both servers here; the specs navigate against them.
 */

export const API_PORT = '3101';

export const WEB_PORT = '3100';

export const API_ORIGIN = `http://127.0.0.1:${API_PORT}`;

/** `127.0.0.1`, not `localhost`: the API's CORS allowlist matches the origin literally. */
export const WEB_ORIGIN = `http://127.0.0.1:${WEB_PORT}`;
