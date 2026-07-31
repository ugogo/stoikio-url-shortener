import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';

import { DebugLink } from '@/components/debug-link';
import { ThemeToggle } from '@/components/theme-toggle';

import appCss from '../styles.css?url';

// Before paint, or dark mode flashes light on load.
const themeBootScript = `(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored
      ? stored === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (_) {}
})();`;

export const Route = createRootRoute({
  head: () => ({
    links: [
      {
        href: appCss,
        rel: 'stylesheet',
      },
    ],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        content: 'width=device-width, initial-scale=1',
        name: 'viewport',
      },
      {
        title: 'Stoikio URL Shortener',
      },
    ],
    scripts: [
      {
        children: themeBootScript,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="fixed end-4 top-4 flex items-center gap-1">
          <DebugLink />
          <ThemeToggle />
        </div>

        {children}

        <Scripts />
      </body>
    </html>
  );
}
