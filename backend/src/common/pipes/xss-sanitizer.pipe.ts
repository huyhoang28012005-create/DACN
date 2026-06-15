/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as xss from 'xss';

@Injectable()
export class XssSanitizerPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      return this.sanitizeObject(value);
    }
    if (typeof value === 'string') {
      return xss.filterXSS(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const key of Object.keys(obj)) {
        sanitizedObj[key] = this.sanitizeObject(obj[key]);
      }
      return sanitizedObj;
    }
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }
    return obj;
  }
}
