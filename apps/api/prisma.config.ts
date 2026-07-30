import { defineConfig } from 'prisma/config';

import { DATABASE_URL } from './src/prisma/database-url';

export default defineConfig({
  datasource: {
    url: DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
