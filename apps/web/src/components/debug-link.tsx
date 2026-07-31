import { Link, useRouterState } from '@tanstack/react-router';
import { Bug, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

/** `import.meta.env.DEV` is replaced at build time, so this drops from production. */
export function DebugLink() {
  if (!import.meta.env.DEV) {
    return null;
  }

  return <DebugNav />;
}

function DebugNav() {
  const onDebugRoute = useRouterState({
    select: (state) => state.location.pathname === '/debug',
  });

  if (onDebugRoute) {
    return (
      <Button
        aria-label="Back to home"
        render={<Link to="/" />}
        size="icon"
        variant="ghost"
      >
        <Home />
      </Button>
    );
  }

  return (
    <Button
      aria-label="Open debug states"
      render={<Link search={{ state: 'idle' }} to="/debug" />}
      size="icon"
      variant="ghost"
    >
      <Bug />
    </Button>
  );
}
