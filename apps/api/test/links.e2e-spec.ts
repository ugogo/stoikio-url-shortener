import type { INestApplication } from '@nestjs/common';
import type { CreatedShortLink } from '@stoikio/contracts';
import type { App } from 'supertest/types';

import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('short links', () => {
  const created: string[] = [];

  let app: INestApplication<App>;

  async function shortenUrl(destination: unknown): Promise<CreatedShortLink> {
    const response = await request(app.getHttpServer())
      .post('/links')
      .send({ destination })
      .expect(201);

    const body = response.body as CreatedShortLink;
    created.push(body.slug);

    return body;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.get(PrismaService).shortLink.deleteMany({
      where: { slug: { in: created } },
    });
    await app.close();
  });

  describe('POST /links', () => {
    it('returns a slug and the stored destination', async () => {
      const body = await shortenUrl('https://example.com/some/page?a=1');

      expect(body.slug).toMatch(/^[A-Za-z0-9_-]{8}$/);
      expect(body.destination).toBe('https://example.com/some/page?a=1');
    });

    it('gives the same URL a different slug each time', async () => {
      const [first, second] = await Promise.all([
        shortenUrl('https://example.com/dup'),
        shortenUrl('https://example.com/dup'),
      ]);

      expect(first.slug).not.toBe(second.slug);
    });

    it('rejects a missing or malformed destination', async () => {
      await request(app.getHttpServer()).post('/links').send({}).expect(400);
      await request(app.getHttpServer())
        .post('/links')
        .send({ destination: 'example.com' })
        .expect(400);
      await request(app.getHttpServer())
        .post('/links')
        .send({ destination: 'javascript:alert(1)' })
        .expect(400);
    });

    it('rejects unknown fields', async () => {
      await request(app.getHttpServer())
        .post('/links')
        .send({ destination: 'https://example.com/', slug: 'chosen00' })
        .expect(400);
    });
  });

  describe('GET /links/:slug', () => {
    it('redirects to the destination with 302 and no-store', async () => {
      const { slug } = await shortenUrl('https://example.com/target');

      const response = await request(app.getHttpServer())
        .get(`/links/${slug}`)
        .expect(302);

      expect(response.headers.location).toBe('https://example.com/target');
      expect(response.headers['cache-control']).toContain('no-store');
    });

    it('404s an unknown slug', async () => {
      await request(app.getHttpServer()).get('/links/doesNotX').expect(404);
    });
  });
});
