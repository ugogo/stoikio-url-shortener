import { defineConfig } from 'prisma/config';

import { ACTIVE_DATABASE_URL } from './src/prisma/database-url';

export default defineConfig({
  datasource: {
    url: ACTIVE_DATABASE_URL,
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
