import { useEffect, useRef, useState } from 'react';

const REVERT_DELAY_MS = 2_000;

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const revertRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Or the timer fires setState on an unmounted component.
  useEffect(() => {
    return () => {
      clearTimeout(revertRef.current);
    };
  }, []);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      // Restart, or a second copy inherits the first one's timer.
      clearTimeout(revertRef.current);
      revertRef.current = setTimeout(() => {
        setCopied(false);
      }, REVERT_DELAY_MS);
    } catch (cause) {
      console.debug('Clipboard write denied', cause);
    }
  }

  return { copied, copy };
}
