import { expect, test } from '@playwright/test';

import { WEB_ORIGIN } from './origins';
import { openShortenForm, shortenUrl } from './shorten';

const DESTINATION = `${WEB_ORIGIN}/?e2e=shorten`;

test('reveals a short link for a valid destination', async ({ page }) => {
  const shortLinkUrl = await shortenUrl(page, DESTINATION);

  expect(shortLinkUrl).toMatch(new RegExp(`^${WEB_ORIGIN}/l/[\\w-]{8}$`));

  // The destination stays in view, so nobody has to trust the slug blind — and it
  // opens in a new tab, which is what its accessible name promises.
  const destinationLink = page.getByRole('link', { name: DESTINATION });

  await expect(destinationLink).toHaveAttribute('href', DESTINATION);
  await expect(destinationLink).toHaveAttribute('target', '_blank');
});

test('copies the short link to the clipboard', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  const shortLinkUrl = await shortenUrl(page, DESTINATION);
  const copy = page.getByRole('button', { name: 'Copy short link' });

  await copy.click();

  await expect(copy).toContainText('Copied');
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(shortLinkUrl);
});

test('shortening another returns an empty, focused field', async ({ page }) => {
  await shortenUrl(page, DESTINATION);

  await page.getByRole('button', { name: 'Shorten another link' }).click();

  const destination = page.getByLabel('Destination URL');

  await expect(destination).toHaveValue('');
  await expect(destination).toBeFocused();
});

test('rejects a destination without a scheme and keeps the field focused', async ({
  page,
}) => {
  const destination = await openShortenForm(page);

  await destination.fill('example.com');
  await destination.press('Enter');

  await expect(page.getByRole('status')).toContainText('Use an http or https URL');
  await expect(destination).toHaveAttribute('aria-invalid', 'true');
  await expect(destination).toBeFocused();
});
