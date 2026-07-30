import type { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

import { BadRequestException, Injectable } from '@nestjs/common';

/** Applied per route, not globally — a global pipe has no schema to validate against. */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join('.'),
        })),
      );
    }

    return result.data;
  }
}
