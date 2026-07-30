import type { CreatedShortLink, CreateShortLinkBody } from '@stoikio/contracts';

import {
  Body,
  Controller,
  Get,
  Header,
  type HttpRedirectResponse,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';
import { createShortLinkSchema } from '@stoikio/contracts';

import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly links: LinksService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createShortLinkSchema)) body: CreateShortLinkBody,
  ): Promise<CreatedShortLink> {
    const link = await this.links.create(body.destination);

    return {
      createdAt: link.createdAt.toISOString(),
      destination: link.destination,
      slug: link.slug,
    };
  }

  @Get(':slug')
  @Header('Cache-Control', 'no-store')
  @Redirect()
  async resolve(@Param('slug') slug: string): Promise<HttpRedirectResponse> {
    const destination = await this.links.resolve(slug);

    if (destination === null) {
      throw new NotFoundException();
    }

    return { statusCode: HttpStatus.FOUND, url: destination };
  }
}
