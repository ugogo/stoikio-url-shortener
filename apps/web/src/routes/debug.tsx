import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { z } from 'zod';

import type { FormStatusProps } from '@/components/form-status';

import { CopyButton } from '@/components/copy-button';
import { DestinationInput } from '@/components/destination-input';
import { FormStatus } from '@/components/form-status';
import { ShortLinkReveal } from '@/components/short-link-reveal';
import { ShortenFrame } from '@/components/shorten-frame';
import { Button } from '@/components/ui/button';
import {
  DEBUG_DESTINATION,
  DEBUG_ERROR,
  DEBUG_SHORT_LINK_URL,
  DEBUG_STATES,
} from '@/lib/debug-fixtures';

// A typo in the URL falls back to idle rather than throwing.
const searchSchema = z.object({
  state: z.enum(DEBUG_STATES).catch('idle'),
});

// Dev only: the route ships either way, so hiding the icon is not enough.
export const Route = createFileRoute('/debug')({
  validateSearch: (search) => searchSchema.parse(search),
  // eslint-disable-next-line perfectionist/sort-objects -- lifecycle order, not alphabetical
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- router control flow
      throw notFound();
    }
  },
  component: DebugStates,
});

function DebugStates() {
  const { state } = Route.useSearch();

  const status: FormStatusProps =
    state === 'success'
      ? {
          destination: DEBUG_DESTINATION,
          shortLinkUrl: DEBUG_SHORT_LINK_URL,
          status: 'success',
        }
      : state === 'error'
        ? { error: DEBUG_ERROR, status: 'error' }
        : { status: state };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 px-6 pt-[26svh] pb-32">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Shorten form states
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Every state the form can hold, held still.
        </p>
      </header>

      <form
        className="flex flex-col gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ShortenFrame invalid={state === 'error'}>
            {state === 'success' ? (
              <>
                <ShortLinkReveal
                  // Forces a remount so the reveal replays.
                  key={state}
                  shortLinkUrl={DEBUG_SHORT_LINK_URL}
                />
                <CopyButton value={DEBUG_SHORT_LINK_URL} />
              </>
            ) : (
              <DestinationInput
                disabled={state === 'pending'}
                invalid={state === 'error'}
              />
            )}
          </ShortenFrame>

          {state === 'success' ? (
            <span className="flex transition-opacity delay-200 duration-200 ease-out starting:opacity-0">
              <Button
                className="h-12 flex-auto sm:h-12"
                render={<Link search={{ state: 'idle' }} to="/debug" />}
                size="xl"
                variant="outline"
              >
                <RotateCcw />
                Shorten another
              </Button>
            </span>
          ) : (
            <Button
              className="h-12 sm:h-12"
              loading={state === 'pending'}
              size="xl"
              type="submit"
            >
              Shorten
              <ArrowRight />
            </Button>
          )}
        </div>

        <FormStatus {...status} />
      </form>

      <p className="text-muted-foreground text-sm text-pretty">
        Composed from the same primitives as the home route, but composed separately — so
        it can drift from it.
      </p>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(--spacing(10),env(safe-area-inset-bottom))]">
        <div className="border-input bg-popover/72 pointer-events-auto flex gap-1.5 rounded-full border p-1.5 shadow-lg backdrop-blur-md dark:bg-input/72">
          {DEBUG_STATES.map((option) => (
            <Button
              className="rounded-full before:rounded-full"
              key={option}
              render={<Link search={{ state: option }} to="/debug" />}
              size="lg"
              variant={option === state ? 'default' : 'ghost'}
            >
              <span className="capitalize">{option}</span>
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
