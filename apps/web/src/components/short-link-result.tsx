import type { CreateResult } from '@/lib/links';

import { buildUrl } from '@/lib/links';

export function ShortLinkResult({ result }: { result: CreateResult }) {
  if (!result.ok) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {result.error}
      </p>
    );
  }

  const shortUrl = buildUrl(result.link.slug);

  return (
    <dl className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Short link</dt>
        <dd>
          <a className="font-medium underline underline-offset-4" href={shortUrl}>
            {shortUrl}
          </a>
        </dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-muted-foreground">Points to</dt>
        <dd className="break-all">{result.link.destination}</dd>
      </div>
    </dl>
  );
}
