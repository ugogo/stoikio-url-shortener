import { CircleAlert, ExternalLink, RotateCcw } from 'lucide-react';

import { CopyButton } from '@/components/copy-button';
import { ShortLinkReveal } from '@/components/short-link-reveal';
import { Button } from '@/components/ui/button';
import { InputPrimitive } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** The one shape every part of the shorten form branches on. */
export type ShortenState =
  | { destination: string; shortLinkUrl: string; status: 'success' }
  | { error: string; status: 'error' }
  | { status: 'idle' }
  | { status: 'pending' };

const DESTINATION_ERROR_ID = 'destination-error';

const DESTINATION_FIELD_ID = 'destination';

/** Presentation only: every branch reads `state.status`, nothing else. */
export function ShortenForm({
  inputProps,
  onShortenAnother,
  onSubmit,
  state,
}: {
  inputProps?: Omit<React.ComponentPropsWithRef<'input'>, 'className' | 'id' | 'type'>;
  onShortenAnother: () => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  state: ShortenState;
}) {
  const invalid = state.status === 'error';

  return (
    <form
      className="grid grid-cols-1 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-3 sm:gap-y-2.5"
      noValidate
      onSubmit={onSubmit}
    >
      {/* One frame for every state, so nothing moves between them. */}
      <div
        className={cn(
          'border-input bg-background not-dark:bg-clip-padding shadow-xs/5 dark:bg-input/32',
          'relative flex h-12 w-full items-center gap-2 rounded-xl border ps-3.5 pe-2',
          'ring-ring/24 transition-shadow has-focus-visible:border-ring has-focus-visible:ring-[3px]',
          'has-aria-invalid:border-destructive/36 has-focus-visible:has-aria-invalid:border-destructive/64',
          'has-focus-visible:has-aria-invalid:ring-destructive/16 dark:has-aria-invalid:ring-destructive/24',
          'has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-disabled:opacity-64',
          // `has-*` drops on blur; a rejection outlives it.
          invalid && 'border-destructive/36',
        )}
      >
        {state.status === 'success' ? (
          <>
            <ShortLinkReveal shortLinkUrl={state.shortLinkUrl} />
            <CopyButton value={state.shortLinkUrl} />
          </>
        ) : (
          <DestinationInput
            disabled={state.status === 'pending'}
            invalid={invalid}
            {...inputProps}
          />
        )}
      </div>

      {state.status === 'success' ? (
        // Don't override the Button's transition.
        <span className="flex animate-in fade-in delay-200 duration-200 ease-out fill-mode-both motion-reduce:animate-none">
          <Button
            aria-label="Shorten another link"
            className="h-12 flex-auto sm:h-12"
            onClick={onShortenAnother}
            size="xl"
            variant="outline"
          >
            <RotateCcw />
          </Button>
        </span>
      ) : (
        <Button
          className="h-12 sm:h-12"
          loading={state.status === 'pending'}
          size="xl"
          type="submit"
        >
          Shorten
        </Button>
      )}

      <FormStatus {...state} />
    </form>
  );
}

function DestinationInput({
  invalid = false,
  ...props
}: Omit<React.ComponentPropsWithRef<'input'>, 'className' | 'id' | 'type'> & {
  invalid?: boolean;
}) {
  return (
    <>
      <Label className="sr-only" htmlFor={DESTINATION_FIELD_ID}>
        Destination URL
      </Label>

      <InputPrimitive
        aria-describedby={invalid ? DESTINATION_ERROR_ID : undefined}
        aria-invalid={invalid || undefined}
        className="placeholder:text-muted-foreground/72 h-full min-w-0 flex-1 bg-transparent px-0 text-base outline-none sm:text-lg"
        id={DESTINATION_FIELD_ID}
        placeholder="https://example.com/a/very/long/page"
        required
        type="url"
        {...props}
      />
    </>
  );
}

/**
 * Always rendered: a live region must exist before its content changes. `min-h-5`
 * stops the frame above nudging.
 */
function FormStatus(props: ShortenState) {
  return (
    <div className="min-h-5 px-1 text-sm" role="status">
      {props.status === 'success' && (
        // Delayed so it lands after the short link has finished revealing.
        <p className="animate-hint-in flex delay-300 fill-mode-both">
          <span className="sr-only">Short link created: {props.shortLinkUrl}. </span>

          <a
            className="text-muted-foreground hover:text-foreground inline-flex min-w-0 max-w-full items-center gap-1 underline-offset-4 transition-colors hover:underline"
            href={props.destination}
            rel="noopener noreferrer"
            target="_blank"
            title={props.destination}
          >
            <span className="truncate">{props.destination}</span>
            <ExternalLink aria-hidden className="size-3.5 shrink-0" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
      )}

      {props.status === 'error' && (
        <p
          className="text-destructive-foreground animate-hint-in flex items-start gap-1.5 text-pretty"
          id={DESTINATION_ERROR_ID}
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {props.error}
        </p>
      )}

      {props.status === 'idle' && (
        <p className="text-muted-foreground animate-hint-in">Press enter to shorten.</p>
      )}
    </div>
  );
}
