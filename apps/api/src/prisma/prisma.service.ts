import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { PrismaClient } from '../generated/prisma/client';
import { DATABASE_URL } from './database-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  constructor() {
    super({
      adapter: new PrismaBetterSqlite3({ url: DATABASE_URL }),
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
