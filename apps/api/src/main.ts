import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const DEFAULT_PORT = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  });

  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}`);
}

void bootstrap();
