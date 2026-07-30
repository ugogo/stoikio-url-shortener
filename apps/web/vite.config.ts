import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

const config = defineConfig({
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
  resolve: {
    alias: {
      // CJS dist breaks Vite SSR (`exports is not defined`); compile from source instead.
      '@stoikio/contracts': path.resolve(root, '../../packages/contracts/src/index.ts'),
    },
    tsconfigPaths: true,
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  ssr: {
    noExternal: ['@stoikio/contracts'],
  },
});

export default config;
