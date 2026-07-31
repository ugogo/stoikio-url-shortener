import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

export function CopyButton({ value }: { value: string }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    // Don't override the Button's transition.
    <span className="animate-in fade-in delay-200 duration-200 ease-out fill-mode-both motion-reduce:animate-none">
      <Button
        aria-label="Copy short link"
        className="rounded-sm before:rounded-[calc(var(--radius-sm)-1px)]"
        onClick={() => void copy(value)}
        size="sm"
        variant="outline"
      >
        <span className="grid shrink-0 place-items-center [&_svg]:col-start-1 [&_svg]:row-start-1">
          <Copy
            className={cn(
              'ease-out-strong transition-[opacity,scale] duration-200',
              copied && 'scale-50 opacity-0 motion-reduce:scale-100',
            )}
          />
          <Check
            className={cn(
              'ease-out-strong transition-[opacity,scale] duration-200',
              !copied && 'scale-50 opacity-0 motion-reduce:scale-100',
            )}
          />
        </span>
        {/* Icon-only on mobile. */}
        <span className="sr-only sm:not-sr-only">{copied ? 'Copied' : 'Copy'}</span>
      </Button>
    </span>
  );
}
