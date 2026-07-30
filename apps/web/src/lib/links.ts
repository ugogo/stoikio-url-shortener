import type { CreatedShortLink } from '@stoikio/contracts';

import { createdShortLinkSchema } from '@stoikio/contracts';
import { z } from 'zod';

export type { CreatedShortLink };

export type CreateResult =
  { error: string; ok: false } | { link: CreatedShortLink; ok: true };

const errorBodySchema = z.object({ message: z.string() }).partial();

const API_URL: string =
  z
    .string()
    .optional()
    .parse(import.meta.env.VITE_API_URL) ?? 'http://localhost:3001';

const RESOLVE_TIMEOUT_MS = 5_000;

export function buildUrl(slug: string): string {
  return `${window.location.origin}/l/${slug}`;
}

/** Never throws — failures come back as a renderable result. */
export async function createShortLink(destination: string): Promise<CreateResult> {
  try {
    const response = await fetch(`${API_URL}/links`, {
      body: JSON.stringify({ destination }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });

    if (!response.ok) {
      const body = errorBodySchema.safeParse(await response.json().catch(() => null));

      return {
        error:
          (body.success ? body.data.message : undefined) ??
          `API responded with ${String(response.status)}`,
        ok: false,
      };
    }

    const link = createdShortLinkSchema.safeParse(await response.json());

    if (!link.success) {
      return { error: 'API returned an unexpected response shape', ok: false };
    }

    return { link: link.data, ok: true };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown error';

    return { error: `Could not reach the API at ${API_URL}: ${message}`, ok: false };
  }
}

/** SSR only: `redirect: 'manual'` is opaque in a browser. */
export async function resolveDestination(slug: string): Promise<null | string> {
  try {
    const response = await fetch(`${API_URL}/links/${encodeURIComponent(slug)}`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS),
    });

    return response.headers.get('location');
  } catch {
    return null;
  }
}
