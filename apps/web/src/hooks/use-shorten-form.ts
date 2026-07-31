import type { CreateShortLinkBody } from '@stoikio/contracts';

import { zodResolver } from '@hookform/resolvers/zod';
import { createShortLinkSchema } from '@stoikio/contracts';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type { ShortenState } from '@/components/shorten-form';
import type { CreatedShortLink } from '@/lib/links';

import { buildUrl, createShortLink } from '@/lib/links';

/** Owns the shorten form's state; hands the route one `ShortenState` to render. */
export function useShortenForm() {
  const [shortLink, setShortLink] = useState<CreatedShortLink | null>(null);

  const form = useForm<CreateShortLinkBody>({
    defaultValues: { destination: '' },
    resolver: zodResolver(createShortLinkSchema),
  });

  const pending = form.formState.isSubmitting;
  const error = form.formState.errors.destination?.message ?? null;

  /** The field is disabled, or not mounted at all, until the next render lands. */
  function refocusDestination() {
    requestAnimationFrame(() => {
      form.setFocus('destination');
    });
  }

  async function shortenUrl({ destination }: CreateShortLinkBody) {
    const next = await createShortLink(destination);

    if (next.ok) {
      setShortLink(next.link);
    } else {
      form.setError('destination', { message: next.error, type: 'server' });
      refocusDestination();
    }
  }

  function shortenAnother() {
    setShortLink(null);
    form.reset();
    refocusDestination();
  }

  // `buildUrl` touches `window`; safe here since success only follows a fetch.
  const state: ShortenState =
    shortLink !== null
      ? {
          destination: shortLink.destination,
          shortLinkUrl: buildUrl(shortLink.slug),
          status: 'success',
        }
      : error !== null
        ? { error, status: 'error' }
        : pending
          ? { status: 'pending' }
          : { status: 'idle' };

  return {
    inputProps: form.register('destination'),
    onSubmit: (event: React.FormEvent<HTMLFormElement>) =>
      void form.handleSubmit(shortenUrl)(event),
    shortenAnother,
    state,
  };
}
