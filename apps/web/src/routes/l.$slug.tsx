import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

import { DeadLinkPage } from '@/components/dead-link-page';
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
  notFoundComponent: NotFoundPage,
});

// Only here to read the param; the page itself is shared with the debug route.
function NotFoundPage() {
  const { slug } = Route.useParams();

  return <DeadLinkPage slug={slug} />;
}
