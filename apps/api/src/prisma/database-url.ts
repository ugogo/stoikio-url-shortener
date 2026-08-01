/** Development and production. `./prisma/*.db` resolves from `apps/api`, the CWD. */
export const DATABASE_URL = 'file:./prisma/dev.db';

/** The web e2e suite's own file, so a run never leaves short links in `dev.db`. */
export const E2E_DATABASE_URL = 'file:./prisma/e2e.db';

/**
 * The one this process opens. Playwright sets the flag and nothing else does: the API
 * is a separate process, so its environment is the only way to tell it which to use.
 */
export const ACTIVE_DATABASE_URL = process.env.USE_E2E_DATABASE
  ? E2E_DATABASE_URL
  : DATABASE_URL;
