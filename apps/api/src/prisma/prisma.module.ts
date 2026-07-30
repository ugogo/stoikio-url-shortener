import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

// Global so feature modules can inject PrismaService without re-importing this.
@Global()
@Module({
  exports: [PrismaService],
  providers: [PrismaService],
})
export class PrismaModule {}
