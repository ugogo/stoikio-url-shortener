import { expect, test } from '@playwright/test';

import { WEB_ORIGIN } from './origins';
import { shortenUrl } from './shorten';

/** A slug 8 random characters long is never one the API handed out. */
const DEAD_SLUG = 'nosuchli';

test('following a short link redirects to its destination', async ({ page }) => {
  const destination = `${WEB_ORIGIN}/?e2e=redirect`;
  const shortLinkUrl = await shortenUrl(page, destination);

  // `302`, never `301`: browsers cache a permanent redirect forever, which would
  // make a mistake permanent and every visit after the first invisible.
  const hop = await page.request.get(shortLinkUrl, { maxRedirects: 0 });

  expect(hop.status()).toBe(302);
  // A same-origin destination comes back as a path, so resolve before comparing.
  expect(new URL(hop.headers().location, shortLinkUrl).href).toBe(destination);

  await page.goto(shortLinkUrl);

  await expect(page).toHaveURL(destination);
  await expect(page.getByRole('heading', { name: 'Shorten a URL' })).toBeVisible();
});

test('a slug that resolves to nothing lands on the dead-link page', async ({ page }) => {
  await page.goto(`/l/${DEAD_SLUG}`);

  await expect(
    page.getByRole('heading', { name: `The short link /l/${DEAD_SLUG} leads nowhere.` }),
  ).toBeVisible();

  // Never the API's raw JSON.
  await expect(page.getByRole('link', { name: 'Shorten a URL' })).toBeVisible();
});

test('the dead-link page leads back to the form', async ({ page }) => {
  await page.goto(`/l/${DEAD_SLUG}`);

  await page.getByRole('link', { name: 'Shorten a URL' }).click();

  await expect(page).toHaveURL(`${WEB_ORIGIN}/`);
  await expect(page.getByLabel('Destination URL')).toBeVisible();
});
