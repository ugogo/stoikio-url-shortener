import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';

import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { HealthStatus } from '../src/health/health.service';

import { AppModule } from '../src/app.module';

describe('GET /health', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responds with 200 and an ok payload', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);
    const body = response.body as HealthStatus;

    expect(body.status).toBe('ok');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    expect(typeof body.uptime).toBe('number');
  });

  it('responds with 404 for an unknown route', async () => {
    await request(app.getHttpServer()).get('/health/unknown').expect(404);
  });
});
