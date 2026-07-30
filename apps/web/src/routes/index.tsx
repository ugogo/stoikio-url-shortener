import { createFileRoute } from '@tanstack/react-router';
import { Link2 } from 'lucide-react';
import { useState } from 'react';

import type { CreateResult } from '@/lib/links';

import { ShortLinkResult } from '@/components/short-link-result';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { createShortLink } from '@/lib/links';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [result, setResult] = useState<CreateResult | null>(null);

  async function shortenUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const field = new FormData(event.currentTarget).get('destination');
    const destination = typeof field === 'string' ? field : '';

    if (destination.length > 0) {
      setResult(await createShortLink(destination));
      return;
    }

    setResult(null);
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <Badge className="w-fit" variant="secondary">
          <Link2 data-icon="inline-start" />
          stoikio
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Shorten a URL
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Paste a full http or https URL. Short links are permanent and cannot be edited
          or deleted.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>New short link</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => void shortenUrl(event)}
          >
            <Input
              aria-label="URL to shorten"
              className="sm:flex-1"
              name="destination"
              placeholder="https://example.com/a/very/long/page"
              required
              type="url"
            />
            <Button type="submit">Shorten</Button>
          </form>

          {result !== null && (
            <>
              <Separator className="my-5" />
              <ShortLinkResult result={result} />
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
