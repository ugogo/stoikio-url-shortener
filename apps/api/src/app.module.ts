import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { LinksModule } from './links/links.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HealthModule, LinksModule, PrismaModule],
})
export class AppModule {}
