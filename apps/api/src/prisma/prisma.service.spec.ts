import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = moduleRef.get(PrismaService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  // PrismaClient hands back a Proxy, so assert on the surface, not `instanceof`.
  // The schema has no models yet, so there is nothing more specific to check.
  it('exposes the client API', () => {
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$queryRaw).toBe('function');
  });

  it('connects to the database', async () => {
    // SQLite returns integers as BigInt through the driver adapter.
    await expect(service.$queryRaw`SELECT 1 AS ok`).resolves.toEqual([{ ok: 1n }]);
  });
});
