import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-muted-foreground font-mono text-sm">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground text-pretty">
        The page you asked for does not exist.
      </p>
      <Button className="w-fit" render={<Link to="/" />} variant="outline">
        Back to home
      </Button>
    </main>
  );
}
