import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

/**
 * Where a visitor lands when a slug resolves to nothing. The cut path is the
 * whole message, so the copy stays out of its way.
 */
export function DeadLinkPage({ slug }: { slug: string }) {
  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-center gap-6 px-6 py-24">
      <h1 className="sr-only">The short link /l/{slug} leads nowhere.</h1>

      {/* Decorative: the strike carries meaning no screen reader can hear. */}
      <p
        aria-hidden
        className="animate-hint-in flex w-full max-w-4xl items-center justify-center gap-[0.06em] font-mono text-3xl leading-none font-medium tracking-tight"
      >
        <span className="text-foreground/24">/l/</span>

        <span className="text-foreground/56 relative min-w-0 truncate">
          {slug}
          <span className="bg-foreground absolute inset-x-[-0.06em] top-1/2 h-[max(2px,0.06em)] -translate-y-1/2 rounded-full" />
        </span>
      </p>

      <Button render={<Link to="/" />} size="lg" variant="secondary">
        Shorten a URL
      </Button>
    </main>
  );
}
