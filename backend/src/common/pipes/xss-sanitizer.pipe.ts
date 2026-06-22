import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as xss from 'xss';

@Injectable()
export class XssSanitizerPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom') {
      return value;
    }

    if (typeof value === 'string') {
      return xss.filterXSS(value);
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }

    return value;
  }

  private sanitizeObject(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitizedObj: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        sanitizedObj[key] = this.sanitizeObject(
          (obj as Record<string, unknown>)[key],
        );
      }
      return sanitizedObj;
    }
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }
    return obj;
  }
}
