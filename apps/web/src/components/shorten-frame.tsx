import { cn } from '@/lib/utils';

/** One frame for every state, so nothing moves between them. */
export function ShortenFrame({
  children,
  invalid = false,
}: {
  children: React.ReactNode;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        'border-input bg-background not-dark:bg-clip-padding shadow-xs/5 dark:bg-input/32',
        'relative flex h-12 w-full items-center gap-2 rounded-xl border ps-3.5 pe-2 sm:flex-1',
        'ring-ring/24 transition-shadow has-focus-visible:border-ring has-focus-visible:ring-[3px]',
        'has-aria-invalid:border-destructive/36 has-focus-visible:has-aria-invalid:border-destructive/64',
        'has-focus-visible:has-aria-invalid:ring-destructive/16 dark:has-aria-invalid:ring-destructive/24',
        'has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-disabled:opacity-64',
        // `has-*` drops on blur; a rejection outlives it.
        invalid && 'border-destructive/36',
      )}
    >
      {children}
    </div>
  );
}
