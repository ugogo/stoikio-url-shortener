import { CircleAlert, ExternalLink } from 'lucide-react';

import { DESTINATION_ERROR_ID } from '@/components/destination-input';

export type FormStatusProps =
  | { destination: string; shortLinkUrl: string; status: 'success' }
  | { error: string; status: 'error' }
  | { status: 'idle' }
  | { status: 'pending' };

/**
 * Always rendered: a live region must exist before its content changes. `min-h-5`
 * stops the frame above nudging.
 */
export function FormStatus(props: FormStatusProps) {
  return (
    <div className="min-h-5 px-1 text-sm" role="status">
      {props.status === 'success' && (
        <p className="flex transition-opacity delay-300 duration-300 ease-out starting:opacity-0">
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
          className="text-destructive-foreground flex items-start gap-1.5 text-pretty transition-[opacity,translate] duration-200 ease-out starting:translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0"
          id={DESTINATION_ERROR_ID}
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {props.error}
        </p>
      )}

      {props.status === 'idle' && (
        <p className="text-muted-foreground">Press enter to shorten.</p>
      )}
    </div>
  );
}
