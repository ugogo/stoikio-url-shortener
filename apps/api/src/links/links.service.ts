import { Injectable } from '@nestjs/common';

import type { ShortLinkModel } from '../generated/prisma/models';

import { PrismaService } from '../prisma/prisma.service';
import { generateSlug } from './slug';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  create(destination: string): Promise<ShortLinkModel> {
    return this.prisma.shortLink.create({
      data: { destination, slug: generateSlug() },
    });
  }

  async resolve(slug: string): Promise<null | string> {
    const link = await this.prisma.shortLink.findUnique({
      select: { destination: true },
      where: { slug },
    });

    return link?.destination ?? null;
  }
}
