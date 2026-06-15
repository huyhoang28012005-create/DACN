/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class SanitizePipe implements PipeTransform {
  private purify: ReturnType<typeof createDOMPurify>;

  constructor() {
    const window = new JSDOM('').window;
    this.purify = createDOMPurify(window);
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' && metadata.type !== 'query') {
      return value;
    }
    return this.sanitize(value);
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return this.purify.sanitize(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = this.sanitize(obj[key]);
        }
      }
      return sanitizedObj;
    }
    return obj;
  }
}
