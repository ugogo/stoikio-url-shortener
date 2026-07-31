import { createFileRoute } from '@tanstack/react-router';

import { ShortenForm } from '@/components/shorten-form';
import { useShortenForm } from '@/hooks/use-shorten-form';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { inputProps, onSubmit, shortenAnother, state } = useShortenForm();

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

      <ShortenForm
        inputProps={inputProps}
        onShortenAnother={shortenAnother}
        onSubmit={onSubmit}
        state={state}
      />
    </main>
  );
}
