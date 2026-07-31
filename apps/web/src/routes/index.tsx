import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { FormStatusProps } from '@/components/form-status';
import type { CreateResult } from '@/lib/links';

import { CopyButton } from '@/components/copy-button';
import { DestinationInput } from '@/components/destination-input';
import { FormStatus } from '@/components/form-status';
import { ShortLinkReveal } from '@/components/short-link-reveal';
import { ShortenFrame } from '@/components/shorten-frame';
import { Button } from '@/components/ui/button';
import { buildUrl, createShortLink } from '@/lib/links';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const refocusRef = useRef(false);

  const shortLink = result?.ok === true ? result.link : null;
  const error = result !== null && !result.ok ? result.error : null;
  // Safe in render: this is only non-null after a fetch.
  const shortLinkUrl = shortLink === null ? null : buildUrl(shortLink.slug);

  // The field is not focusable yet on the render that sets this.
  useEffect(() => {
    if (refocusRef.current && inputRef.current?.disabled === false) {
      refocusRef.current = false;
      inputRef.current.focus();
    }
  });

  async function shortenUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    const form = event.currentTarget;
    const field = new FormData(form).get('destination');
    const destination = typeof field === 'string' ? field : '';

    if (destination.length === 0) {
      setResult(null);
      return;
    }

    setPending(true);
    setResult(null);

    try {
      const next = await createShortLink(destination);

      setResult(next);

      if (!next.ok) {
        refocusRef.current = true;
      }
    } finally {
      setPending(false);
    }
  }

  function shortenAnother() {
    setResult(null);
    refocusRef.current = true;
  }

  const status: FormStatusProps =
    shortLink !== null && shortLinkUrl !== null
      ? { destination: shortLink.destination, shortLinkUrl, status: 'success' }
      : error !== null
        ? { error, status: 'error' }
        : pending
          ? { status: 'pending' }
          : { status: 'idle' };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 pt-[26svh] pb-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Shorten a URL
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Paste a link to get a permanent short URL.
        </p>
      </header>

      <form className="flex flex-col gap-2.5" onSubmit={(event) => void shortenUrl(event)}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ShortenFrame invalid={error !== null}>
            {shortLinkUrl === null ? (
              <DestinationInput
                disabled={pending}
                invalid={error !== null}
                ref={inputRef}
              />
            ) : (
              <>
                <ShortLinkReveal shortLinkUrl={shortLinkUrl} />
                <CopyButton value={shortLinkUrl} />
              </>
            )}
          </ShortenFrame>

          {shortLink === null ? (
            <Button className="h-12 sm:h-12" loading={pending} size="xl" type="submit">
              Shorten
              <ArrowRight />
            </Button>
          ) : (
            // A second `transition-*` on the Button would replace its own.
            <span className="flex transition-opacity delay-200 duration-200 ease-out starting:opacity-0">
              <Button
                className="h-12 flex-auto sm:h-12"
                onClick={shortenAnother}
                size="xl"
                variant="outline"
              >
                <RotateCcw />
                Shorten another
              </Button>
            </span>
          )}
        </div>

        <FormStatus {...status} />
      </form>
    </main>
  );
}
