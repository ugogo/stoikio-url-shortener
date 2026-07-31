import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  // SSR snapshot is light; the client corrects itself right after hydration.
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();

    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <Button
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      onClick={toggle}
      size="icon"
      variant="ghost"
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}

function isDark() {
  return document.documentElement.classList.contains('dark');
}

// The boot script in __root.tsx sets the class before React mounts, so the DOM is the
// source of truth rather than component state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, { attributeFilter: ['class'] });

  return () => {
    observer.disconnect();
  };
}
