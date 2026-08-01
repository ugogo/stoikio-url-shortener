import type { Locator, Page } from '@playwright/test';

import { expect } from '@playwright/test';

/** Matches the short link the form announces, whatever origin serves it. */
const SHORT_LINK_URL = /https?:\/\/\S+\/l\/[\w-]+/;

/**
 * Opens the form and hands back its destination field, once React owns it.
 *
 * SSR ships the markup before hydration, and a submit that lands in between does
 * nothing at all — a race no visitor is quick enough to lose and Playwright never
 * wins. The fiber key is how React marks a node as one it has claimed.
 */
export async function openShortenForm(page: Page): Promise<Locator> {
  await page.goto('/');
  await page.waitForFunction(() =>
    Object.keys(document.querySelector('form') ?? {}).some((key) =>
      key.startsWith('__reactFiber$'),
    ),
  );

  return page.getByLabel('Destination URL');
}

/**
 * Shortens `destination` the way a visitor does — no API calls behind the form's
 * back — and hands back the short link it revealed.
 */
export async function shortenUrl(page: Page, destination: string): Promise<string> {
  const field = await openShortenForm(page);

  await field.fill(destination);
  await page.getByRole('button', { exact: true, name: 'Shorten' }).click();

  const status = page.getByRole('status');
  await expect(status).toContainText('Short link created');

  const announcement = (await status.textContent()) ?? '';
  const shortLinkUrl = SHORT_LINK_URL.exec(announcement);

  if (shortLinkUrl === null) {
    throw new Error(`The form announced no short link: "${announcement}"`);
  }

  return shortLinkUrl[0];
}
