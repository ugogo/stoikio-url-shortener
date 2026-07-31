import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { resolveDestination } from '@/lib/links';

// Resolved server-side so a dead link is a page, not the API's JSON 404.
export const Route = createFileRoute('/l/$slug')({
  beforeLoad: async ({ params }) => {
    const destination = await resolveDestination(params.slug);

    if (destination === null) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router control flow
      throw notFound();
    }

    // eslint-disable-next-line @typescript-eslint/only-throw-error -- router control flow
    throw redirect({ href: destination, statusCode: 302 });
  },
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-muted-foreground font-mono text-sm">dead link</p>
      <h1 className="text-3xl font-semibold tracking-tight">This link does not work</h1>
      <p className="text-muted-foreground text-pretty">
        The short link you followed was mistyped, truncated, or never created.
      </p>
      <Button className="w-fit" render={<Link to="/" />} variant="outline">
        Shorten a URL
      </Button>
    </main>
  );
}
