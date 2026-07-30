import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = moduleRef.get(HealthService);
  });

  it('is defined', () => {
    expect(service).toBeInstanceOf(HealthService);
  });

  it('reports an ok status', () => {
    expect(service.check().status).toBe('ok');
  });

  it('reports an ISO timestamp', () => {
    const { timestamp } = service.check();

    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('reports a non-negative uptime', () => {
    expect(service.check().uptime).toBeGreaterThanOrEqual(0);
  });
});
