import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HealthStatus } from './health.service';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  const stub: HealthStatus = {
    status: 'ok',
    timestamp: '2026-07-30T00:00:00.000Z',
    uptime: 42,
  };

  let controller: HealthController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    })
      .overrideProvider(HealthService)
      .useValue({ check: vi.fn(() => stub) })
      .compile();

    controller = moduleRef.get(HealthController);
  });

  it('is defined', () => {
    expect(controller).toBeInstanceOf(HealthController);
  });

  it('returns the status produced by the service', () => {
    expect(controller.check()).toEqual(stub);
  });
});
